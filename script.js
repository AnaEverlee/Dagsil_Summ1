document.addEventListener('DOMContentLoaded', () => {
    const cart = [];
    const cartContainer = document.querySelector('.dynamic-cart');
    const addToCartButtons = document.querySelectorAll('.menu-add-to-cart');
    const purchaseBtn = document.getElementById('purchase-btn');

    const scriptURL = 'https://script.google.com/macros/s/AKfycbzcPuIJsWJunhDpgkAEkiqkQcDwY9OQkCXfPRiKdxFaJSWewzbeX67Og2f-nValShpMrQ/exec';

    addToCartButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const itemCard = btn.closest('.menu-card-container');
            const itemName = itemCard.querySelector('.item-name').textContent;
            const itemPriceText = itemCard.querySelector('.item-price').textContent;

            const priceMatch = itemPriceText.match(/Php\s*(\d+)/i);
            const itemPrice = priceMatch ? parseFloat(priceMatch[1]) : 0;

            const existingItem = cart.find(item => item.name === itemName);

            if (existingItem) {
                existingItem.quantity++;
                alert("Item quantity increased by 1!");
            } else {
                cart.push({ name: itemName, price: itemPrice, quantity: 1 });
                alert("Item has been added successfully!");
            }
            updateCartDisplay();
        });
    });

    function updateCartDisplay() {
        cartContainer.innerHTML = '';

        if (cart.length === 0) {
            cartContainer.textContent = 'Your cart is empty.';
            return;
        }

        const itemList = document.createElement('ul');

        cart.forEach((item, index) => {
            const li = document.createElement('li');
            li.style.marginBottom = '10px';

            li.innerHTML = `
                <span>${item.name} - Php ${item.price.toFixed(2)}</span>
                <span style="margin-left: 10px;">
                    Qty: 
                    <button class="qty-decrease" data-index="${index}">-</button> 
                    <span class="quantity">${item.quantity}</span> 
                    <button class="qty-increase" data-index="${index}">+</button>
                </span>
                <span style="margin-left: 10px;">
                    Subtotal: Php ${(item.price * item.quantity).toFixed(2)}
                </span>
            `;

            itemList.appendChild(li);
        });

        const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const vat = subtotal * 0.12;
        const total = subtotal + vat;

        const priceDetails = document.createElement('div');
        priceDetails.classList.add('price-to-pay');
        priceDetails.style.marginTop = '20px';
        priceDetails.innerHTML = `
            <p>Subtotal: Php ${subtotal.toFixed(2)}</p>
            <p>VAT (12%): Php ${vat.toFixed(2)}</p>
            <p><strong>Total: Php ${total.toFixed(2)}</strong></p>
        `;

        cartContainer.appendChild(itemList);
        cartContainer.appendChild(priceDetails);

        document.querySelectorAll('.qty-increase').forEach(button => {
            button.addEventListener('click', () => {
                const i = button.getAttribute('data-index');
                cart[i].quantity++;
                updateCartDisplay();
            });
        });

        document.querySelectorAll('.qty-decrease').forEach(button => {
            button.addEventListener('click', () => {
                const i = button.getAttribute('data-index');
                cart[i].quantity--;
                if (cart[i].quantity <= 0) {
                    cart.splice(i, 1);
                }
                updateCartDisplay();
            });
        });
    }

    purchaseBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        const timestamp = new Date().toISOString();
        const orderNumber = Date.now();

        const itemsStr = cart.map(item => `${item.name} x ${item.quantity}`).join(', ');
        const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const vat = subtotal * 0.12;
        const total = subtotal + vat;

        const formData = new FormData();
        formData.append('timestamp', timestamp);
        formData.append('orderNumber', orderNumber);
        formData.append('items', itemsStr);
        formData.append('subtotal', subtotal.toFixed(2));
        formData.append('vat', vat.toFixed(2));
        formData.append('total', total.toFixed(2));

        fetch(scriptURL, {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(text => {
            alert("Order submitted successfully!");
            window.print();
            cart.length = 0;
            updateCartDisplay();
        })
        .catch(error => {
            alert("Submission failed: " + error.message);
        });
    });
});
