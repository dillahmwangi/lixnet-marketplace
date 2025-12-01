<!-- FILE 3: resources/views/home.blade.php -->
<!-- Home page for unauthenticated users -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
    <div class="flex items-center justify-center min-h-screen px-4">
        <div class="max-w-md w-full bg-slate-700 rounded-lg p-8 border border-slate-600 text-center">
            <div class="text-5xl mb-4">🔐</div>
            <h1 class="text-2xl font-bold text-white mb-4">Welcome</h1>
            
            <p class="text-slate-300 mb-6">
                This is an external product application using SSO authentication. You need to be redirected from the marketplace with a valid token.
            </p>

            <a href="http://localhost:8000" 
               target="_blank"
               class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition">
                Go to Marketplace
            </a>

            <hr class="border-slate-600 my-6">

            <details class="text-left text-slate-300 text-sm">
                <summary class="cursor-pointer font-semibold mb-2">Technical Info</summary>
                <div class="bg-slate-600 p-3 rounded text-xs space-y-1">
                    <p><strong>Product App:</strong> Port 8001</p>
                    <p><strong>Marketplace:</strong> Port 8000</p>
                    <p><strong>Auth Method:</strong> JWT via SSO</p>
                    <p><strong>Token Location:</strong> Query parameter in URL</p>
                </div>
            </details>
        </div>
    </div>
</body>
</html>