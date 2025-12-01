<!-- FILE 2: resources/views/sso-error.blade.php -->
<!-- Error page when SSO authentication fails -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Authentication Error</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full bg-slate-700 rounded-lg p-8 border border-slate-600">
        <div class="text-red-500 text-5xl text-center mb-4">✕</div>
        <h1 class="text-2xl font-bold text-white text-center mb-4">Authentication Failed</h1>
        
        <div class="bg-red-900 border border-red-700 rounded p-4 mb-6">
            <p class="text-red-200">{{ $error ?? 'An authentication error occurred' }}</p>
        </div>

        <div class="space-y-2 text-slate-300 text-sm mb-6">
            <p><strong>What happened?</strong></p>
            <ul class="list-disc list-inside space-y-1">
                <li>The token was invalid or expired</li>
                <li>The token could not be verified</li>
                <li>You may not have access to this product</li>
            </ul>
        </div>

        <div class="space-y-3">
            <a href="http://localhost:8000" 
               class="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-center transition">
                Return to Marketplace
            </a>
            <button onclick="window.history.back()"
                    class="block w-full bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg font-semibold transition">
                Go Back
            </button>
        </div>
    </div>
</body>
</html>