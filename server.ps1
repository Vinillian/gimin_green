$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8000/")
$listener.Start()
Write-Host "Сервер запущен на http://localhost:8000"
while ($listener.IsListening) {
    $context = $listener.GetContext()
    $filePath = $context.Request.Url.LocalPath.TrimStart('/')
    if ([string]::IsNullOrEmpty($filePath)) { $filePath = "index.html" }
    $fullPath = Join-Path $PWD $filePath
    if (Test-Path $fullPath -PathType Leaf) {
        $response = $context.Response
        $buffer = [System.IO.File]::ReadAllBytes($fullPath)
        $response.ContentLength64 = $buffer.Length
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
    } else {
        $context.Response.StatusCode = 404
    }
    $context.Response.Close()
}
