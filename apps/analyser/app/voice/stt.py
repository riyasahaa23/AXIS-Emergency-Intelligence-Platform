class SpeechToText:
    def __init__(self, model: str = "base") -> None:
        self.model = model

    def transcribe(self, audio_path: str) -> str:
        try:
            from faster_whisper import WhisperModel  # type: ignore[import-not-found]
        except ImportError as exc:
            raise RuntimeError("Install the 'voice' extra to use speech recognition") from exc
        segments, _ = WhisperModel(self.model).transcribe(audio_path)
        return " ".join(segment.text.strip() for segment in segments).strip()
