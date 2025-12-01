<!-- FILE 1: resources/views/sso-dashboard.blade.php -->
<!-- This is the main dashboard shown after SSO authentication -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ session('sso_user')->product ?? 'Product' }} Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
    <nav class="bg-slate-800 border-b border-slate-700 shadow-lg">
        <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-white">
                    {{ session('sso_user')->product ?? 'Product' }}
                </h1>
                <p class="text-slate-300 text-sm">Via Marketplace SSO</p>
            </div>
            <form action="/logout" method="POST" class="inline">
                @csrf
                <button type="submit" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition">
                    Logout
                </button>
            </form>
        </div>
    </nav>

    <div class="max-w-6xl mx-auto px-4 py-8">
        <!-- Success Message -->
        <div class="bg-green-900 border border-green-700 rounded-lg p-4 mb-8">
            <p class="text-green-200 font-semibold">✓ Successfully logged in via Marketplace SSO!</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- User Information Card -->
            <div class="lg:col-span-1">
                <div class="bg-slate-700 rounded-lg p-6 border border-slate-600">
                    <h2 class="text-xl font-bold text-white mb-4">Your Account</h2>
                    
                    <div class="space-y-4">
                        <div>
                            <p class="text-slate-400 text-sm">User ID</p>
                            <p class="text-white font-semibold">{{ session('sso_user')->user_id }}</p>
                        </div>

                        <div>
                            <p class="text-slate-400 text-sm">Email</p>
                            <p class="text-white font-semibold">{{ session('sso_user')->email }}</p>
                        </div>

                        <div>
                            <p class="text-slate-400 text-sm">Name</p>
                            <p class="text-white font-semibold">{{ session('sso_user')->name }}</p>
                        </div>

                        <hr class="border-slate-600 my-4">

                        <div>
                            <p class="text-slate-400 text-sm mb-2">Subscription Tier</p>
                            <div class="inline-block px-3 py-1 rounded-full text-sm font-bold
                                @if(session('product_tier') === 'premium')
                                    bg-purple-600 text-white
                                @elseif(session('product_tier') === 'basic')
                                    bg-blue-600 text-white
                                @else
                                    bg-gray-600 text-white
                                @endif
                            ">
                                {{ strtoupper(session('product_tier', 'free')) }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Features Available -->
            <div class="lg:col-span-2">
                <div class="bg-slate-700 rounded-lg p-6 border border-slate-600">
                    <h2 class="text-xl font-bold text-white mb-4">Features Unlocked</h2>
                    
                    @php
                        $features = session('product_features', []);
                        $featureCount = count($features);
                    @endphp

                    @if($featureCount > 0)
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            @foreach($features as $feature)
                                <div class="flex items-start gap-3 bg-slate-600 p-3 rounded">
                                    <svg class="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="text-slate-200">{{ $feature }}</span>
                                </div>
                            @endforeach
                        </div>
                    @else
                        <p class="text-slate-400">No features available in your current tier</p>
                    @endif

                    <p class="text-slate-400 text-sm mt-4">
                        Total: <strong>{{ $featureCount }} features</strong>
                    </p>
                </div>
            </div>
        </div>

        <!-- Raw Token Data (for debugging) -->
        <div class="mt-8 bg-slate-700 rounded-lg p-6 border border-slate-600">
            <h2 class="text-xl font-bold text-white mb-4">SSO Token Data (Debug)</h2>
            
            <pre class="bg-slate-800 p-4 rounded text-slate-200 text-sm overflow-x-auto">{{ json_encode(session('sso_user'), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) }}</pre>
        </div>

        <!-- Back to Marketplace Link -->
        <div class="mt-8 text-center">
            <p class="text-slate-400 mb-4">Want to explore more products?</p>
            <a href="http://localhost:8000" 
               target="_blank"
               class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition">
                Back to Marketplace →
            </a>
        </div>
    </div>
</body>
</html>





