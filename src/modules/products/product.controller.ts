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
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <style type="text/tailwindcss">
      @theme {
        --color-primary: #6366f1;
        --color-primary-hover: #4f46e5;
        --color-bg: #0f172a;
        --color-surface: rgba(30, 41, 59, 0.7);
        --font-sans: 'Outfit', sans-serif;
      }
      body {
        background-color: var(--color-bg);
        color: #f8fafc;
        background-image: 
          radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(236, 72, 153, 0.1) 0px, transparent 50%);
        background-attachment: fixed;
        min-height: 100vh;
      }
      .glass {
        background: rgba(30, 41, 59, 0.6);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      .autocomplete-items {
        position: absolute;
        border-radius: 0.5rem;
        background: #1e293b;
        border: 1px solid rgba(255, 255, 255, 0.1);
        z-index: 99;
        top: 100%;
        left: 0;
        right: 0;
        max-height: 250px;
        overflow-y: auto;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
      }
      .autocomplete-item {
        padding: 0.75rem 1rem;
        cursor: pointer;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .autocomplete-item:hover {
        background: rgba(99, 102, 241, 0.2);
      }
      .autocomplete-item img {
        width: 40px;
        height: 40px;
        border-radius: 0.25rem;
        object-fit: cover;
      }
    </style>
</head>
<body class="font-sans antialiased flex flex-col">
    <div class="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col min-h-screen">
        <header class="glass sticky top-0 z-50 mb-8 rounded-b-2xl shadow-lg">
            <div class="flex flex-col sm:flex-row justify-between items-center py-5 px-6 gap-4">
                <h1 class="text-2xl font-bold tracking-tight text-white"><a href="/" class="hover:text-indigo-400 transition-colors">✨ PPRS</a></h1>
                <nav class="flex items-center gap-4 w-full sm:w-auto justify-center">
                    <a href="/" class="text-slate-200 hover:text-indigo-400 font-medium transition-colors">Home</a>
                    <a href="/create" class="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2 rounded-lg font-semibold shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 whitespace-nowrap">
                        + New Product
                    </a>
                </nav>
            </div>
        </header>

        <main class="flex-1 pb-12">
            ${content}
        </main>
        
        <footer class="py-8 text-center text-slate-400 border-t border-white/10 mt-auto">
            <p>&copy; ${new Date().getFullYear()} Product Price Recording System. Designed for Excellence.</p>
        </footer>
    </div>
    
    <script>
      function confirmDelete(id) {
        Swal.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#ef4444',
          cancelButtonColor: '#334155',
          confirmButtonText: 'Yes, delete it!',
          background: '#1e293b',
          color: '#f8fafc'
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
                const imgHtml = imgSrc ? \`<img src="\${imgSrc}" />\` : \`<div style="width:40px;height:40px;background:#334155;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:10px;">No</div>\`;
                
                item.innerHTML = \`
                  \${imgHtml}
                  <div>
                    <div class="font-semibold text-white">\${p.name}</div>
                    <div class="text-xs text-slate-400">ID: \${p.id} | ฿\${p.price.toLocaleString('th-TH')}</div>
                  </div>
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
    </script>
</body>
</html>
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
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 class="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Inventory Management</h2>
        <form action="/search" method="GET" class="flex w-full sm:w-auto gap-2 relative">
          <div class="relative w-full sm:w-72">
            <input type="text" id="search-input" name="q" placeholder="Search by name or ID..." autocomplete="off" class="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" />
          </div>
          <button type="submit" class="bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors border border-slate-600 whitespace-nowrap">Search</button>
        </form>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        ${products.length === 0 ? '<div class="col-span-full text-center py-16 glass rounded-2xl text-slate-400 text-lg border border-dashed border-slate-600">No products found. Start by adding one!</div>' : ''}
        ${products.map(p => `
          <div class="glass rounded-2xl overflow-hidden hover:-translate-y-2 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300 group animate-[fadeIn_0.5s_ease_forwards]">
            <div class="h-48 relative bg-black/20 flex items-center justify-center overflow-hidden">
              ${p.image ? `<img src="/public/images/${p.image}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />` : `<div class="italic text-slate-500">No Image</div>`}
              
              <div class="absolute top-3 right-3 flex gap-2 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <a href="/edit/${p.id}" class="bg-black/60 backdrop-blur text-white p-2 rounded-full hover:bg-indigo-500 transition-colors border border-white/10 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                </a>
                <form id="delete-form-${p.id}" action="/delete/${p.id}" method="POST" class="hidden"></form>
                <button type="button" onclick="confirmDelete('${p.id}')" class="bg-black/60 backdrop-blur text-red-400 p-2 rounded-full hover:bg-red-500 hover:text-white transition-colors border border-white/10 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
            <div class="p-5">
              <div class="text-xs text-slate-400 font-mono tracking-wider mb-1">ID: ${p.id}</div>
              <h3 class="text-xl font-semibold text-white mb-2 truncate" title="${p.name}">${p.name}</h3>
              <p class="text-2xl font-bold text-indigo-400">฿${p.price.toLocaleString('th-TH')}</p>
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
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 class="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Search: "${keyword}"</h2>
        <a href="/" class="bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors border border-slate-600 text-center w-full sm:w-auto">Clear Search</a>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        ${products.length === 0 ? '<div class="col-span-full text-center py-16 glass rounded-2xl text-slate-400 text-lg border border-dashed border-slate-600">No products found matching your search.</div>' : ''}
        ${products.map(p => `
          <div class="glass rounded-2xl overflow-hidden hover:-translate-y-2 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300 group animate-[fadeIn_0.5s_ease_forwards]">
            <div class="h-48 relative bg-black/20 flex items-center justify-center overflow-hidden">
              ${p.image ? `<img src="/public/images/${p.image}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />` : `<div class="italic text-slate-500">No Image</div>`}
              
              <div class="absolute top-3 right-3 flex gap-2 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <a href="/edit/${p.id}" class="bg-black/60 backdrop-blur text-white p-2 rounded-full hover:bg-indigo-500 transition-colors border border-white/10 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                </a>
                <form id="delete-form-${p.id}" action="/delete/${p.id}" method="POST" class="hidden"></form>
                <button type="button" onclick="confirmDelete('${p.id}')" class="bg-black/60 backdrop-blur text-red-400 p-2 rounded-full hover:bg-red-500 hover:text-white transition-colors border border-white/10 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
            <div class="p-5">
              <div class="text-xs text-slate-400 font-mono tracking-wider mb-1">ID: ${p.id}</div>
              <h3 class="text-xl font-semibold text-white mb-2 truncate" title="${p.name}">${p.name}</h3>
              <p class="text-2xl font-bold text-indigo-400">฿${p.price.toLocaleString('th-TH')}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    return new Response(layout("Search Results", content), { headers: { "Content-Type": "text/html" } });
  })
  .get("/create", () => {
    const content = `
      <div class="max-w-xl mx-auto glass rounded-2xl p-6 sm:p-8 shadow-2xl animate-[fadeIn_0.4s_ease]">
        <h2 class="text-2xl font-bold text-white mb-6">Add New Product</h2>
        <form action="/create" method="POST" enctype="multipart/form-data" class="space-y-5" onsubmit="showLoading(this)">
          <div>
            <label for="name" class="block text-sm font-medium text-slate-300 mb-1.5">Product Name</label>
            <input type="text" id="name" name="name" required placeholder="e.g. Wireless Mouse" class="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" />
          </div>
          
          <div>
            <label for="price" class="block text-sm font-medium text-slate-300 mb-1.5">Price (THB)</label>
            <input type="number" id="price" name="price" step="0.01" required placeholder="0.00" class="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" />
          </div>
          
          <div>
            <label for="image" class="block text-sm font-medium text-slate-300 mb-1.5">Product Image (Optional)</label>
            <div class="relative w-full">
              <input type="file" id="image" name="image" accept="image/*" class="w-full text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600 bg-slate-800/50 border border-slate-700 border-dashed rounded-lg p-2 transition-all cursor-pointer" />
            </div>
          </div>
          
          <div class="pt-6 border-t border-slate-700/50 flex flex-col sm:flex-row justify-end gap-3">
            <a href="/" class="bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors border border-slate-600 text-center w-full sm:w-auto">Cancel</a>
            <button type="submit" id="submit-btn" class="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg shadow-indigo-500/30 transition-all w-full sm:w-auto flex justify-center items-center gap-2">
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
      return new Response(layout("Not Found", "<div class='text-center py-20'><h2 class='text-3xl text-white'>Product not found</h2><a href='/' class='text-indigo-400 mt-4 inline-block hover:underline'>Return Home</a></div>"), { headers: { "Content-Type": "text/html" } });
    }

    const content = `
      <div class="max-w-xl mx-auto glass rounded-2xl p-6 sm:p-8 shadow-2xl animate-[fadeIn_0.4s_ease]">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-white mb-1">Edit Product</h2>
          <p class="text-slate-400 font-mono text-sm">ID: ${product.id}</p>
        </div>
        
        <form action="/edit/${product.id}" method="POST" enctype="multipart/form-data" class="space-y-5" onsubmit="showLoading(this)">
          <div>
            <label for="name" class="block text-sm font-medium text-slate-300 mb-1.5">Product Name</label>
            <input type="text" id="name" name="name" value="${product.name.replace(/"/g, '&quot;')}" required class="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" />
          </div>
          
          <div>
            <label for="price" class="block text-sm font-medium text-slate-300 mb-1.5">Price (THB)</label>
            <input type="number" id="price" name="price" step="0.01" value="${product.price}" required class="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1.5">Current Image</label>
            <div class="bg-slate-900/50 rounded-lg p-4 mb-3 flex justify-center border border-slate-700/50">
              ${product.image ? `<img src="/public/images/${product.image}" alt="${product.name}" class="max-h-48 rounded-md object-contain" />` : '<span class="text-slate-500 italic py-8">No image uploaded</span>'}
            </div>
            
            <label for="image" class="block text-sm font-medium text-slate-300 mb-1.5">Upload New Image (Replaces current)</label>
            <input type="file" id="image" name="image" accept="image/*" class="w-full text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600 bg-slate-800/50 border border-slate-700 border-dashed rounded-lg p-2 transition-all cursor-pointer" />
            <p class="text-xs text-slate-500 mt-2">Leave empty to keep the current image.</p>
          </div>
          
          <div class="pt-6 border-t border-slate-700/50 flex flex-col sm:flex-row justify-end gap-3">
            <a href="/" class="bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors border border-slate-600 text-center w-full sm:w-auto">Cancel</a>
            <button type="submit" id="submit-btn" class="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg shadow-indigo-500/30 transition-all w-full sm:w-auto flex justify-center items-center gap-2">
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
