param(
  [string]$TextPath,
  [string]$OutPath,
  [int]$Rate = 0,
  [string]$VoiceName = "",
  [switch]$ListVoices
)

Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer

if ($ListVoices) {
  $synth.GetInstalledVoices() | ForEach-Object { $_.VoiceInfo.Name }
  exit 0
}

if ($VoiceName -ne "") {
  try { $synth.SelectVoice($VoiceName) } catch {}
}

$synth.Rate = $Rate
$text = Get-Content -LiteralPath $TextPath -Raw -Encoding UTF8
$synth.SetOutputToWaveFile($OutPath)
$synth.Speak($text)
$synth.Dispose()
