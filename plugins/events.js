export default function({ app, store, $tools }, inject){
    if(!process.server){
        // Page view 
        window.addEventListener('PAGE_VIEW', (e)=> {
            // Analytics ready
            if(store.state.settings && store.state.settings.google_analytics_id){
                console.log("%cGoogle Analytics Page View", 'color: #bada55');
                gtag('js', new Date());
                gtag('config',window.escape(`${store.state.settings.google_analytics_id}`));
            }
            // Google ads ready
            if (store.state.settings && store.state.settings.google_ads && store.state.settings.google_ads.id) {
                console.log("%cGoogle Ads Page View", 'color: #bada55');
                gtag('config', `${store.state.settings.google_ads.id}`);
            }
            // Facebook Snap Tiktok Linkedin
            fbPageView();
            snapPageView();
            if(e.data && e.data._id){
                fbViewContent({
                    content_name: e.data.name,
                    content_ids: [e.data._id],
                    content_type: "product",
                    value: e.data.price.salePrice,
                    currency: store.state.currency.code
                });
                snapViewContent({ item_ids: [e.data._id] });
            }
            //tiktokPageView();
            //linkedinPageView();
        });
        window.addEventListener('ADD_TO_CART', (e) => {
            const item = $tools.reformCartItem(e.data);
            let exists = null;
            if(item.variant) exists = store.state.cart.find(i => i._id === item._id && i.variant && i.variant._id === item.variant._id);
            else exists = store.state.cart.find(i => i._id === item._id);
            if(exists){
                item.parents = [...new Set([...exists.parents, ...item.parents])];
                exists.quantity = item.quantity;
            }else{
                //
                store.state.cart.push(item);
            }
            $tools.setCart(store.state.cart);
            fbAddToCart({
                id: item._id,
                content_name: item.name,
                content_ids: [item._id],
                content_type: 'product',
                value: item.price,
                currency: store.state.currency.code || "USD"
            });
            snapAddToCart({
                item_ids: [item._id],
                price: item.price,
                currency: store.state.code || "USD"
            });
        });
        window.addEventListener('REMOVE_FROM_CART', (e)=>{
            const item = $tools.reformCartItem(e.data);
            let index = -1;
            if(item.variant) index = store.state.cart.findIndex(i => i._id === item._id && i.variant && i.variant._id === item.variant._id);
            else index = store.state.cart.findIndex(i => i._id === item._id);
            if(index == -1) return;
            store.state.cart.splice(index, 1);
            const childs = store.state.cart.filter(i => i.parents && i.parents.includes(item._id));
            for (const child of childs) {
                const childIndex = store.state.cart.findIndex(i => i._id == child._id);
                child.parents.splice(child.parents.indexOf(item._id), 1);
                if(child.parents.length == 0) store.state.cart.splice(childIndex, 1);
            }
            $tools.setCart(store.state.cart);
        });
        window.addEventListener('ADD_TO_WISHLIST', (e) => {
            const item = $tools.reformWishlistItem(e.data);
            let exists = store.state.wishlist.find(i => i._id === item._id);
            if(!exists) store.state.wishlist.push(item);
            $tools.setWishlist(store.state.wishlist);
            fbAddToWishlist({ id: item._id, content_name: item.name, content_ids: [item._id], content_type: 'product' });
            snapAddToWishlist({ item_ids: [item._id] });
        });
        window.addEventListener('REMOVE_FROM_WISHLIST', (e)=>{
            const item = $tools.reformWishlistItem(e.data);
            let index = store.state.wishlist.findIndex(i => i._id === item._id);
            if(index == -1) return;
            store.state.wishlist.splice(index, 1);
            $tools.setWishlist(store.state.wishlist);
        });
    }
}