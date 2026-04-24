import { Elysia, t } from "elysia";
import { productService } from "./product.service";

// A utility to wrap HTML content with layout
const layout = (title: string, content: string) => `
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | PPRS</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <style type="text/tailwindcss">
      @theme {
        --color-primary: #6366f1;
        --color-primary-hover: #4f46e5;
        --color-bg: #09090b; /* Much darker background */
        --font-sans: 'Outfit', sans-serif;
      }
      body {
        background-color: var(--color-bg);
        color: #f8fafc;
        background-image: 
          radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.12), transparent 40%),
          radial-gradient(circle at 85% 30%, rgba(236, 72, 153, 0.12), transparent 40%),
          radial-gradient(circle at 50% 100%, rgba(14, 165, 233, 0.1), transparent 50%);
        background-attachment: fixed;
        min-height: 100vh;
      }
      /* Premium Glass Effect */
      .glass-premium {
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.7) 100%);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-top-color: rgba(255, 255, 255, 0.15);
        border-left-color: rgba(255, 255, 255, 0.15);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05);
      }
      .glass-navbar {
        background: rgba(15, 23, 42, 0.65);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.6);
      }
      .autocomplete-items {
        position: absolute;
        border-radius: 0.75rem;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        z-index: 99;
        top: calc(100% + 8px);
        left: 0;
        right: 0;
        max-height: 300px;
        overflow-y: auto;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
      }
      .autocomplete-item {
        padding: 0.75rem 1rem;
        cursor: pointer;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        display: flex;
        align-items: center;
        gap: 1rem;
        transition: all 0.2s;
      }
      .autocomplete-item:last-child {
        border-bottom: none;
      }
      .autocomplete-item:hover {
        background: rgba(99, 102, 241, 0.25);
        padding-left: 1.25rem;
      }
      .autocomplete-item img {
        width: 48px;
        height: 48px;
        border-radius: 0.5rem;
        object-fit: cover;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
      }
      
      /* Webkit scrollbar for custom scroll */
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
    </style>
</head>
<body class="font-sans antialiased flex flex-col">
    <!-- Premium Navbar -->
    <header class="glass-navbar sticky top-0 z-50">
        <div class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col sm:flex-row justify-between items-center py-4 gap-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    </div>
                    <h1 class="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
                        <a href="/" class="hover:text-white transition-colors">PPRS</a>
                    </h1>
                </div>
                <nav class="flex items-center gap-6 w-full sm:w-auto justify-center">
                    <a href="/" class="text-slate-300 hover:text-white font-medium transition-colors relative group">
                        Home
                        <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full"></span>
                    </a>
                    <a href="/create" class="relative group bg-slate-800/80 hover:bg-slate-700/80 text-white px-5 py-2.5 rounded-xl font-semibold border border-white/10 transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:border-indigo-500/50 flex items-center gap-2 overflow-hidden">
                        <span class="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                        <svg class="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        <span class="relative z-10">New Product</span>
                    </a>
                </nav>
            </div>
        </div>
    </header>

    <div class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col flex-1 mt-8 pb-12">
        <main class="flex-1">
            ${content}
        </main>
    </div>
    
    <footer class="py-6 text-center text-slate-500 border-t border-white/5 bg-black/20 mt-auto backdrop-blur-md">
        <p class="text-sm font-medium">&copy; ${new Date().getFullYear()} PPRS System. Crafted with Precision & Elegance.</p>
    </footer>
    
    <script>
      function confirmDelete(id) {
        Swal.fire({
          title: '<h3 class="text-2xl font-bold text-white">Delete Product?</h3>',
          html: '<p class="text-slate-400">This action cannot be undone. The image file will also be permanently removed.</p>',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#ef4444',
          cancelButtonColor: '#334155',
          confirmButtonText: 'Yes, delete it!',
          background: 'rgba(15, 23, 42, 0.95)',
          backdrop: 'rgba(0, 0, 0, 0.8)',
          customClass: {
            popup: 'border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl',
            confirmButton: 'rounded-lg font-semibold px-6 py-2.5',
            cancelButton: 'rounded-lg font-semibold px-6 py-2.5'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            document.getElementById('delete-form-' + id).submit();
          }
        });
      }

      // Autocomplete Logic
      document.addEventListener('DOMContentLoaded', () => {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;

        let debounceTimer;
        
        const closeList = () => {
          const list = document.getElementById('autocomplete-list');
          if (list) list.remove();
        };

        searchInput.addEventListener('input', function(e) {
          const val = this.value;
          closeList();
          if (!val) return;

          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(async () => {
            try {
              const res = await fetch(\`/api/search?q=\${encodeURIComponent(val)}\`);
              const products = await res.json();
              
              if (products.length === 0) return;

              const list = document.createElement('div');
              list.setAttribute('id', 'autocomplete-list');
              list.setAttribute('class', 'autocomplete-items');
              
              this.parentNode.appendChild(list);

              products.forEach(p => {
                const item = document.createElement('div');
                item.setAttribute('class', 'autocomplete-item');
                
                const imgSrc = p.image ? \`/public/images/\${p.image}\` : '';
                const imgHtml = imgSrc ? \`<img src="\${imgSrc}" />\` : \`<div class="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 text-xs font-medium border border-white/5">No Pic</div>\`;
                
                item.innerHTML = \`
                  \${imgHtml}
                  <div class="flex-1 min-w-0">
                    <div class="font-bold text-white text-base truncate">\${p.name}</div>
                    <div class="text-xs text-slate-400 font-mono mt-0.5">ID: \${p.id}</div>
                  </div>
                  <div class="font-bold text-indigo-400">฿\${p.price.toLocaleString('th-TH')}</div>
                \`;
                
                item.addEventListener('click', () => {
                  window.location.href = \`/search?q=\${encodeURIComponent(p.id)}\`;
                });
                list.appendChild(item);
              });
            } catch (err) {
              console.error(err);
            }
          }, 300);
        });

        document.addEventListener('click', (e) => {
          if (e.target !== searchInput) closeList();
        });
      });

      // Camera Logic setup
      function initCamera() {
        const btnUpload = document.getElementById('btn-upload');
        const btnCamera = document.getElementById('btn-camera');
        const uploadSection = document.getElementById('upload-section');
        const cameraSection = document.getElementById('camera-section');
        const video = document.getElementById('camera-video');
        const canvas = document.getElementById('camera-canvas');
        const preview = document.getElementById('camera-preview');
        const btnCapture = document.getElementById('btn-capture');
        const btnRetake = document.getElementById('btn-retake');
        const imageInput = document.getElementById('image');
        let stream = null;

        if (!btnUpload || !btnCamera) return;

        function stopCamera() {
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
          }
        }

        async function startCamera() {
          // Check for secure context / API availability
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            Swal.fire({
              icon: 'warning',
              title: 'HTTPS Required',
              html: '<p class="text-sm text-slate-300">Camera access is blocked by your browser because you are using an insecure connection (HTTP over a network IP).</p><p class="text-sm text-slate-300 mt-2">To use the camera on your phone, you must either use <b>HTTPS</b> or test via a service like <b>Ngrok</b> or <b>Cloudflare Tunnel</b>.</p>',
              background: 'rgba(15, 23, 42, 0.95)',
              color: '#f8fafc',
              customClass: { popup: 'border border-white/10 rounded-2xl backdrop-blur-xl' }
            });
            btnUpload.click();
            return;
          }

          try {
            // Try to use the back camera ideally, but fallback to any camera available
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
            video.srcObject = stream;
            video.classList.remove('hidden');
            preview.classList.add('hidden');
            btnCapture.classList.remove('hidden');
            btnRetake.classList.add('hidden');
          } catch (err) {
            try {
              // Fallback to basic video request if the specific constraint fails
              stream = await navigator.mediaDevices.getUserMedia({ video: true });
              video.srcObject = stream;
              video.classList.remove('hidden');
              preview.classList.add('hidden');
              btnCapture.classList.remove('hidden');
              btnRetake.classList.add('hidden');
            } catch (fallbackErr) {
              Swal.fire({
                icon: 'error',
                title: 'Camera Error',
                text: 'Could not access the camera. Please ensure a camera is connected and permissions are granted.',
                background: 'rgba(15, 23, 42, 0.95)',
                color: '#f8fafc',
                customClass: { popup: 'border border-white/10 rounded-2xl backdrop-blur-xl' }
              });
              // Revert back to upload tab
              btnUpload.click();
            }
          }
        }

        const activeTabClass = "flex-1 py-2.5 px-4 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/50 font-semibold transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]";
        const inactiveTabClass = "flex-1 py-2.5 px-4 bg-slate-800/50 text-slate-400 rounded-xl border border-white/5 font-medium hover:bg-slate-700 hover:text-slate-200 transition-all";

        btnUpload.addEventListener('click', () => {
          btnUpload.className = activeTabClass;
          btnCamera.className = inactiveTabClass;
          uploadSection.classList.remove('hidden');
          cameraSection.classList.add('hidden');
          cameraSection.classList.remove('flex');
          stopCamera();
        });

        btnCamera.addEventListener('click', () => {
          btnCamera.className = activeTabClass;
          btnUpload.className = inactiveTabClass;
          uploadSection.classList.add('hidden');
          cameraSection.classList.remove('hidden');
          cameraSection.classList.add('flex');
          startCamera();
        });

        btnCapture.addEventListener('click', () => {
          if (!stream) return;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext('2d').drawImage(video, 0, 0);
          
          canvas.toBlob((blob) => {
            const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
            const dt = new DataTransfer();
            dt.items.add(file);
            imageInput.files = dt.files;
            
            preview.src = URL.createObjectURL(blob);
            preview.classList.remove('hidden');
            video.classList.add('hidden');
            btnCapture.classList.add('hidden');
            btnRetake.classList.remove('hidden');
            stopCamera();
          }, 'image/jpeg', 0.9);
        });

        btnRetake.addEventListener('click', () => {
          imageInput.value = ''; 
          startCamera();
        });
      }

      document.addEventListener('DOMContentLoaded', initCamera);
    </script>
</body>
</html>
`;

const cameraUI = `
  <div>
    <label class="block text-sm font-semibold text-slate-300 mb-2">Product Image</label>
    <div class="flex gap-3 mb-4 p-1.5 bg-slate-900/50 rounded-xl border border-white/5 backdrop-blur-sm w-full">
      <button type="button" id="btn-upload" class="flex-1 py-2.5 px-4 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/50 font-semibold transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]">
        📁 Upload File
      </button>
      <button type="button" id="btn-camera" class="flex-1 py-2.5 px-4 bg-transparent text-slate-400 rounded-xl border border-transparent font-medium hover:bg-slate-800 hover:text-slate-200 transition-all">
        📷 Camera
      </button>
    </div>
    
    <div id="upload-section" class="relative w-full animate-[fadeIn_0.3s_ease]">
      <div class="relative group cursor-pointer">
        <div class="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-50"></div>
        <input type="file" id="image" name="image" accept="image/*" class="relative w-full text-slate-400 file:mr-5 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600 bg-slate-800/80 border-2 border-slate-700/80 border-dashed rounded-xl p-3 transition-all hover:border-indigo-500/50 cursor-pointer shadow-inner" />
      </div>
    </div>
    
    <div id="camera-section" class="hidden w-full bg-slate-900/80 border border-slate-700 rounded-xl p-5 flex-col items-center gap-4 animate-[fadeIn_0.3s_ease] shadow-inner">
      <div class="w-full relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-white/10 shadow-lg">
        <video id="camera-video" class="w-full h-full object-cover" autoplay playsinline></video>
        <img id="camera-preview" class="hidden w-full h-full object-cover" />
      </div>
      <canvas id="camera-canvas" class="hidden"></canvas>
      <div class="flex gap-3 w-full mt-1">
        <button type="button" id="btn-capture" class="flex-1 bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-500 hover:to-emerald-600 text-white py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:-translate-y-0.5">
          📸 Capture Photo
        </button>
        <button type="button" id="btn-retake" class="hidden flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:-translate-y-0.5">
          🔄 Retake
        </button>
      </div>
    </div>
  </div>
`;

export const productController = new Elysia({ prefix: "" })
  .get("/api/search", async ({ query }) => {
    const keyword = query.q as string || "";
    if (!keyword) return [];
    const products = await productService.searchProducts(keyword);
    return products.slice(0, 5); // limit suggestions to 5
  })
  .get("/", async () => {
    const products = await productService.getAllProducts();
    
    const content = `
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
        <div>
          <h2 class="text-4xl font-black bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent mb-2">Inventory Management</h2>
          <p class="text-slate-400 font-medium">Manage and monitor all your product prices.</p>
        </div>
        <form action="/search" method="GET" class="flex w-full sm:w-auto gap-3 relative">
          <div class="relative w-full sm:w-80 group">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <input type="text" id="search-input" name="q" placeholder="Search by name or ID..." autocomplete="off" class="w-full bg-slate-900/60 backdrop-blur-md border border-white/10 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner placeholder-slate-500" />
          </div>
          <button type="submit" class="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:shadow-[0_0_25px_rgba(79,70,229,0.6)] whitespace-nowrap">Search</button>
        </form>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        ${products.length === 0 ? '<div class="col-span-full flex flex-col items-center justify-center py-20 glass-premium rounded-3xl text-center"><div class="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4"><svg class="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg></div><h3 class="text-xl font-bold text-white mb-2">No Products Found</h3><p class="text-slate-400">Click on "New Product" to add your first item to the inventory.</p></div>' : ''}
        ${products.map((p, i) => `
          <div class="glass-premium rounded-3xl overflow-hidden hover:-translate-y-3 hover:border-indigo-400/50 transition-all duration-500 group animate-[fadeIn_0.6s_ease_forwards]" style="animation-delay: ${i * 0.05}s; opacity: 0;">
            <div class="h-56 relative bg-black/40 flex items-center justify-center overflow-hidden border-b border-white/5">
              ${p.image ? `<img src="/public/images/${p.image}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />` : `<div class="italic text-slate-600 font-medium">No Image Uploaded</div>`}
              
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div class="absolute top-4 right-4 flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" style="transition-delay: 0.1s;">
                <a href="/edit/${p.id}" class="bg-indigo-500/80 hover:bg-indigo-400 backdrop-blur-md text-white p-2.5 rounded-xl transition-colors border border-white/20 shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                </a>
                <form id="delete-form-${p.id}" action="/delete/${p.id}" method="POST" class="hidden"></form>
                <button type="button" onclick="confirmDelete('${p.id}')" class="bg-rose-500/80 hover:bg-rose-400 backdrop-blur-md text-white p-2.5 rounded-xl transition-colors border border-white/20 shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
            <div class="p-6 relative">
              <div class="absolute -top-6 left-6 bg-slate-800 text-slate-300 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg border border-white/10 shadow-lg">ID: ${p.id}</div>
              <h3 class="text-xl font-bold text-white mb-3 truncate mt-1" title="${p.name}">${p.name}</h3>
              <p class="text-3xl font-black bg-gradient-to-br from-indigo-300 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">฿${p.price.toLocaleString('th-TH')}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    return new Response(layout("Inventory", content), { headers: { "Content-Type": "text/html" } });
  })
  .get("/search", async ({ query }) => {
    const keyword = query.q as string || "";
    const products = await productService.searchProducts(keyword);
    
    const content = `
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
        <div>
          <h2 class="text-4xl font-black bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent mb-2">Search: "${keyword}"</h2>
          <p class="text-slate-400 font-medium">Found ${products.length} results matching your query.</p>
        </div>
        <a href="/" class="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-all border border-white/10 shadow-lg text-center w-full sm:w-auto">Clear Search</a>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        ${products.length === 0 ? '<div class="col-span-full flex flex-col items-center justify-center py-20 glass-premium rounded-3xl text-center"><h3 class="text-xl font-bold text-white mb-2">No Matches Found</h3><p class="text-slate-400">Try using different keywords or checking the ID.</p></div>' : ''}
        ${products.map((p, i) => `
          <div class="glass-premium rounded-3xl overflow-hidden hover:-translate-y-3 hover:border-indigo-400/50 transition-all duration-500 group animate-[fadeIn_0.6s_ease_forwards]" style="animation-delay: ${i * 0.05}s; opacity: 0;">
            <div class="h-56 relative bg-black/40 flex items-center justify-center overflow-hidden border-b border-white/5">
              ${p.image ? `<img src="/public/images/${p.image}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />` : `<div class="italic text-slate-600 font-medium">No Image Uploaded</div>`}
              
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div class="absolute top-4 right-4 flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                <a href="/edit/${p.id}" class="bg-indigo-500/80 hover:bg-indigo-400 backdrop-blur-md text-white p-2.5 rounded-xl transition-colors border border-white/20 shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                </a>
                <form id="delete-form-${p.id}" action="/delete/${p.id}" method="POST" class="hidden"></form>
                <button type="button" onclick="confirmDelete('${p.id}')" class="bg-rose-500/80 hover:bg-rose-400 backdrop-blur-md text-white p-2.5 rounded-xl transition-colors border border-white/20 shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
            <div class="p-6 relative">
              <div class="absolute -top-6 left-6 bg-slate-800 text-slate-300 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg border border-white/10 shadow-lg">ID: ${p.id}</div>
              <h3 class="text-xl font-bold text-white mb-3 truncate mt-1" title="${p.name}">${p.name}</h3>
              <p class="text-3xl font-black bg-gradient-to-br from-indigo-300 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">฿${p.price.toLocaleString('th-TH')}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    return new Response(layout("Search Results", content), { headers: { "Content-Type": "text/html" } });
  })
  .get("/create", () => {
    const content = `
      <div class="max-w-2xl mx-auto glass-premium rounded-3xl p-8 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-[fadeIn_0.5s_ease]">
        <h2 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-8">Add New Product</h2>
        <form action="/create" method="POST" enctype="multipart/form-data" class="space-y-6" onsubmit="showLoading(this)">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="name" class="block text-sm font-semibold text-slate-300 mb-2">Product Name</label>
              <input type="text" id="name" name="name" required placeholder="e.g. Wireless Mouse" class="w-full bg-slate-900/60 backdrop-blur-sm border border-white/10 text-white rounded-xl px-5 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner placeholder-slate-600" />
            </div>
            
            <div>
              <label for="price" class="block text-sm font-semibold text-slate-300 mb-2">Price (THB)</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 font-bold">฿</div>
                <input type="number" id="price" name="price" step="0.01" required placeholder="0.00" class="w-full bg-slate-900/60 backdrop-blur-sm border border-white/10 text-white rounded-xl pl-10 pr-5 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner placeholder-slate-600" />
              </div>
            </div>
          </div>
          
          ${cameraUI}
          
          <div class="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-end gap-4 mt-8">
            <a href="/" class="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all border border-white/10 shadow-lg text-center w-full sm:w-auto">Cancel</a>
            <button type="submit" id="submit-btn" class="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] w-full sm:w-auto flex justify-center items-center gap-2 hover:-translate-y-0.5">
              <span>Save Product</span>
            </button>
          </div>
        </form>
      </div>
      <script>
        function showLoading(form) {
          const btn = form.querySelector('#submit-btn');
          btn.innerHTML = '<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> <span>Saving...</span>';
          btn.classList.add('opacity-80', 'cursor-not-allowed');
        }
      </script>
    `;
    
    return new Response(layout("Create Product", content), { headers: { "Content-Type": "text/html" } });
  })
  .post("/create", async ({ body }) => {
    const { name, price, image } = body as any;
    
    await productService.createProduct(
      name, 
      parseFloat(price), 
      (image && typeof image === 'object' && image.size > 0) ? image : null
    );
    
    return Response.redirect("/", 302);
  })
  .get("/edit/:id", async ({ params, set }) => {
    const product = await productService.getProductById(params.id);
    
    if (!product) {
      set.status = 404;
      return new Response(layout("Not Found", "<div class='text-center py-20 glass-premium max-w-lg mx-auto rounded-3xl'><h2 class='text-3xl font-bold text-white mb-4'>Product Not Found</h2><a href='/' class='bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-3 rounded-xl font-bold inline-block transition-all mt-4'>Return Home</a></div>"), { headers: { "Content-Type": "text/html" } });
    }

    const content = `
      <div class="max-w-2xl mx-auto glass-premium rounded-3xl p-8 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-[fadeIn_0.5s_ease]">
        <div class="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <h2 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Edit Product</h2>
          <div class="bg-slate-800/80 px-4 py-2 rounded-xl border border-white/10 font-mono text-sm text-slate-300 shadow-inner">
            <span class="text-slate-500 font-sans font-medium mr-2">ID</span>${product.id}
          </div>
        </div>
        
        <form action="/edit/${product.id}" method="POST" enctype="multipart/form-data" class="space-y-6" onsubmit="showLoading(this)">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="name" class="block text-sm font-semibold text-slate-300 mb-2">Product Name</label>
              <input type="text" id="name" name="name" value="${product.name.replace(/"/g, '&quot;')}" required class="w-full bg-slate-900/60 backdrop-blur-sm border border-white/10 text-white rounded-xl px-5 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner" />
            </div>
            
            <div>
              <label for="price" class="block text-sm font-semibold text-slate-300 mb-2">Price (THB)</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 font-bold">฿</div>
                <input type="number" id="price" name="price" step="0.01" value="${product.price}" required class="w-full bg-slate-900/60 backdrop-blur-sm border border-white/10 text-white rounded-xl pl-10 pr-5 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner" />
              </div>
            </div>
          </div>
          
          <div class="p-5 bg-black/20 rounded-2xl border border-white/5">
            <label class="block text-sm font-semibold text-slate-300 mb-3">Current Image</label>
            <div class="bg-slate-900/80 rounded-xl p-4 flex justify-center border border-white/5 shadow-inner">
              ${product.image ? `<img src="/public/images/${product.image}" alt="${product.name}" class="max-h-56 rounded-lg object-contain shadow-lg border border-white/10" />` : '<span class="text-slate-500 italic font-medium py-10">No image currently</span>'}
            </div>
          </div>
          
          ${cameraUI}
          
          <div class="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-end gap-4 mt-8">
            <a href="/" class="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all border border-white/10 shadow-lg text-center w-full sm:w-auto">Cancel</a>
            <button type="submit" id="submit-btn" class="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] w-full sm:w-auto flex justify-center items-center gap-2 hover:-translate-y-0.5">
              <span>Update Product</span>
            </button>
          </div>
        </form>
      </div>
      <script>
        function showLoading(form) {
          const btn = form.querySelector('#submit-btn');
          btn.innerHTML = '<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> <span>Updating...</span>';
          btn.classList.add('opacity-80', 'cursor-not-allowed');
        }
      </script>
    `;
    
    return new Response(layout("Edit Product", content), { headers: { "Content-Type": "text/html" } });
  })
  .post("/edit/:id", async ({ params, body }) => {
    const { name, price, image } = body as any;
    
    await productService.updateProduct(
      params.id,
      name,
      parseFloat(price),
      (image && typeof image === 'object' && image.size > 0) ? image : null
    );
    
    return Response.redirect("/", 302);
  })
  .post("/delete/:id", async ({ params }) => {
    await productService.deleteProduct(params.id);
    return Response.redirect("/", 302);
  });
