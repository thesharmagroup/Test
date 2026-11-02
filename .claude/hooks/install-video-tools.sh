#!/bin/bash
# Install the AI video-editing toolchain in Claude Code cloud sessions, whose
# containers start fresh every time:
#   FFmpeg       cuts, joins, frame grabs, exports
#   whisper.cpp  speech-to-text with word timings (prebuilt, from nixpkgs)
#   yt-dlp       downloads reference videos
#   Remotion     React video framework; per-project npm package, needs only
#                Node + a browser, which it downloads itself on first render
#   HyperFrames  HTML-to-video CLI plus its four core Claude Code skills
# Every step is skipped when its tool is already present, so re-runs are fast.
set -uo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

HYPERFRAMES_VERSION=0.9.1
# Multilingual model: handles Hindi/Hinglish; the *.en models do not.
WHISPER_MODEL_NAME=large-v3-turbo
WHISPER_MODEL_SHA256=1fc70f774d38eb169993ac391eea357ef47c88757ef72ee5943879b7e8e2bc69
# HyperFrames looks for whisper models here, so both tools share one copy.
MODELS_DIR="$HOME/.cache/hyperframes/whisper/models"
WHISPER_MODEL="$MODELS_DIR/ggml-$WHISPER_MODEL_NAME.bin"

log() { echo "[video-tools] $*" >&2; }

install_ffmpeg() {
  command -v ffmpeg >/dev/null && return 0
  log "installing ffmpeg"
  apt-get update -qq >&2 && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq ffmpeg >&2
}

install_ytdlp() {
  if ! command -v yt-dlp >/dev/null; then
    log "installing yt-dlp"
    curl -fsSL --retry 3 -o /usr/local/bin/yt-dlp.part \
      https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp &&
      chmod +x /usr/local/bin/yt-dlp.part &&
      mv /usr/local/bin/yt-dlp.part /usr/local/bin/yt-dlp || return 1
  fi
  # YouTube extraction needs a JS runtime; Node is in the image.
  mkdir -p "$HOME/.config/yt-dlp"
  grep -qs -- '--js-runtimes' "$HOME/.config/yt-dlp/config" ||
    echo '--js-runtimes node' >> "$HOME/.config/yt-dlp/config"
}

install_whisper() {
  command -v whisper-cli >/dev/null && return 0
  if ! command -v nix >/dev/null; then
    log "nix not found; cannot install whisper.cpp"
    return 1
  fi
  log "installing whisper.cpp from nixpkgs"
  nix profile add nixpkgs#whisper-cpp >&2
}

install_whisper_model() {
  if [ -f "$WHISPER_MODEL" ] &&
    echo "$WHISPER_MODEL_SHA256  $WHISPER_MODEL" | sha256sum -c --status; then
    return 0
  fi
  log "downloading whisper model $WHISPER_MODEL_NAME (1.6 GB)"
  mkdir -p "$MODELS_DIR"
  curl -fsSL --retry 3 -o "$WHISPER_MODEL.part" \
    "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-$WHISPER_MODEL_NAME.bin" || return 1
  if ! echo "$WHISPER_MODEL_SHA256  $WHISPER_MODEL.part" | sha256sum -c --status; then
    log "whisper model checksum mismatch"
    rm -f "$WHISPER_MODEL.part"
    return 1
  fi
  mv "$WHISPER_MODEL.part" "$WHISPER_MODEL"
}

install_hyperframes() {
  if ! npm ls -g --depth=0 "hyperframes@$HYPERFRAMES_VERSION" >/dev/null 2>&1; then
    log "installing hyperframes@$HYPERFRAMES_VERSION"
    npm install -g --no-audit --no-fund "hyperframes@$HYPERFRAMES_VERSION" >&2 || return 1
  fi
  [ -f "$HOME/.claude/skills/hyperframes/SKILL.md" ] && return 0
  log "installing HyperFrames core skills"
  (cd "$HOME" && hyperframes skills update >&2)
}

# Run the independent installs in parallel and report every failure.
declare -A pids
for step in ffmpeg ytdlp whisper whisper_model hyperframes; do
  "install_$step" &
  pids[$step]=$!
done
failed=()
for step in "${!pids[@]}"; do
  wait "${pids[$step]}" || failed+=("$step")
done

# Expose paths to the session's Bash tool.
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo "export WHISPER_MODEL=\"$WHISPER_MODEL\"" >> "$CLAUDE_ENV_FILE"
  # Playwright's headless shell lets HyperFrames use its fast capture path.
  shell=$(ls /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | sort -V | tail -1)
  [ -n "$shell" ] && echo "export HYPERFRAMES_BROWSER_PATH=\"$shell\"" >> "$CLAUDE_ENV_FILE"
fi

if [ ${#failed[@]} -gt 0 ]; then
  log "failed: ${failed[*]}"
  exit 1
fi
log "ready: ffmpeg, whisper-cli, yt-dlp, remotion (via npx), hyperframes"
