Add-Type -AssemblyName System.IO.Compression.FileSystem
$pptxPath = "D:\Me\ТПР\Самостоятельная_работа_Шакшуев_ПИКД2.pptx"

if (-not (Test-Path $pptxPath)) {
    Write-Error "File not found: $pptxPath"
    exit 1
}

$zip = [System.IO.Compression.ZipFile]::OpenRead($pptxPath)
$slides = $zip.Entries | Where-Object { $_.FullName -match '^ppt/slides/slide\d+\.xml$' } | Sort-Object { 
    $num = [regex]::Match($_.FullName, '\d+').Value
    [int]$num
}

foreach ($slide in $slides) {
    Write-Output "=== Slide $($slide.FullName) ==="
    $stream = $slide.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $xmlText = $reader.ReadToEnd()
    $reader.Close()
    $stream.Close()
    
    # Extract text contents inside <a:t>...</a:t>
    $matches = [regex]::Matches($xmlText, '<a:t[^>]*>(.*?)</a:t>')
    $texts = New-Object System.Collections.Generic.List[string]
    foreach ($m in $matches) {
        $texts.Add($m.Groups[1].Value)
    }
    
    Write-Output ($texts -join " ")
    Write-Output ""
}

$zip.Dispose()
