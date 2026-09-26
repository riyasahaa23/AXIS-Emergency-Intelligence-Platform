import subprocess


def synthesize(text: str, output_path: str, model_path: str | None = None) -> None:
    if not model_path:
        raise RuntimeError("A Piper model path is required for text-to-speech")
    subprocess.run(["piper", "--model", model_path, "--output_file", output_path], input=text.encode(), check=True)
