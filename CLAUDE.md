# Video editing toolchain

Cloud sessions install these at startup (`.claude/hooks/install-video-tools.sh`):

| Tool | Command | Notes |
|---|---|---|
| FFmpeg | `ffmpeg`, `ffprobe` | Cuts, joins, frame grabs, exports |
| Whisper | `whisper-cli` | whisper.cpp from nixpkgs; multilingual `large-v3-turbo` model at `$WHISPER_MODEL` |
| yt-dlp | `yt-dlp` | YouTube and Instagram often block cloud IPs; pass `--cookies cookies.txt` |
| Remotion | `npx remotion ...` inside a Remotion project | Downloads its own headless browser on first render |
| HyperFrames | `hyperframes` | Skills: `/hyperframes`, `/hyperframes-cli`, `/hyperframes-registry`, `/media-use` |

Transcribing Hindi or Hinglish speech with word timings:

```bash
ffmpeg -i input.mp4 -ar 16000 -ac 1 -c:a pcm_s16le audio.wav
whisper-cli -m "$WHISPER_MODEL" -f audio.wav -l hi -nf -ml 1 -sow -oj -of words
```

`-nf` turns off temperature fallback, which otherwise loops on Hinglish and runs about 3x slower.
`-ml 1 -sow` gives one JSON segment per word; offsets are in milliseconds.
