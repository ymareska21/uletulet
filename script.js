let cart = []
let currentSection = "home"
let isLoggedIn = false
let currentUser = null
let deliveryMethod = "pickup"
let selectedSize = "Grande"
let currentProduct = null

// Navigation - Fixed function
function showSection(sectionName) {
  // Hide all sections
  document
    .querySelectorAll(".home-section, .menu-section, .location-section, .products-section, .contact-section")
    .forEach((section) => {
      section.style.display = "none"
      section.classList.remove("active")
    })

    

  // Show selected section
  const targetSection = document.getElementById(getSectionId(sectionName))
  if (targetSection) {
    targetSection.style.display = "block"
    targetSection.classList.add("active")
  }

  // Update navigation active state
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active")
  })

  // Find and activate the clicked nav item
  const clickedNavItem = Array.from(document.querySelectorAll(".nav-item")).find(
    (item) => item.textContent.toLowerCase() === sectionName.toLowerCase(),
  )
  if (clickedNavItem) {
    clickedNavItem.classList.add("active")
  }

  currentSection = sectionName
  window.scrollTo(0, 0)
}

// Helper function to get correct section ID
function getSectionId(sectionName) {
  const sectionMap = {
    home: "home",
    menu: "menu",
    products: "products",
    locations: "locations",
    contact: "contact",
  }
  return sectionMap[sectionName] || sectionName
}

// Product Modal Functions
function openProductModal(id, name, price, description, image) {
  currentProduct = { id, name, price, description, image }

  document.getElementById("modalProductName").textContent = name
  document.getElementById("modalProductPrice").textContent = `Php ${price}`
  document.getElementById("modalProductDescription").textContent = description
  document.getElementById("modalProductImage").src = image
  document.getElementById("modalProductImage").alt = name

  // Reset size selection
  selectedSize = "Grande"
  document.querySelectorAll(".size-btn").forEach((btn) => btn.classList.remove("active"))
  document.querySelector(".size-btn").classList.add("active")

  document.getElementById("productModal").classList.add("active")
  document.body.style.overflow = "hidden"
}

function closeProductModal() {
  document.getElementById("productModal").classList.remove("active")
  document.body.style.overflow = "auto"
  currentProduct = null
}

function selectSize(size) {
  selectedSize = size
  document.querySelectorAll(".size-btn").forEach((btn) => {
    btn.classList.remove("active")
  })
  event.target.classList.add("active")
}

function addProductToCart() {
  if (currentProduct) {
    const productName = `${currentProduct.name} (${selectedSize})`
    addToCart(currentProduct.id, productName, currentProduct.price)
    closeProductModal()

    // Show success notification
    showNotification("Product added to cart!", "success")
  }
}

// Cart functionality
function addToCart(id, name, price) {
  const existingItem = cart.find((item) => item.id === id && item.name === name)

  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({
      id: id,
      name: name,
      price: price,
      quantity: 1,
    })
  }

  updateCartCount()
  updateCartDisplay()

  // Show success feedback for regular add to cart
  if (!currentProduct) {
    const button = event.target
    const originalText = button.innerHTML
    button.innerHTML = '<i class="fas fa-check"></i> Added!'
    button.style.background = "linear-gradient(135deg, #10B981, #059669)"

    setTimeout(() => {
      button.innerHTML = originalText
      button.style.background = ""
    }, 1500)
  }
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id)
  updateCartCount()
  updateCartDisplay()
}

function updateQuantity(id, change) {
  const item = cart.find((item) => item.id === id)
  if (item) {
    item.quantity += change
    if (item.quantity <= 0) {
      removeFromCart(id)
    } else {
      updateCartCount()
      updateCartDisplay()
    }
  }
}

function getTotalItems() {
  return cart.reduce((sum, item) => sum + item.quantity, 0)
}

function updateCartCount() {
  const totalItems = getTotalItems()
  document.getElementById("cartCount").textContent = totalItems
  const modalCartCount = document.getElementById("cartCountModal")
  if (modalCartCount) {
    modalCartCount.textContent = totalItems
  }
}

function updateCartDisplay() {
  const cartItemsContainer = document.getElementById("cartItems")
  const cartTotalContainer = document.getElementById("cartTotal")

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h4>Your cart is empty</h4>
                <p>Add some delicious coffee to get started!</p>
            </div>
        `
    cartTotalContainer.innerHTML = ""
    document.getElementById("deliveryOptions").style.display = "none"
    return
  }

  // Display cart items
  cartItemsContainer.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
            </div>
            <button class="remove-item" onclick="removeFromCart('${item.id}')">Remove</button>
        </div>
    `,
    )
    .join("")

  // Calculate and display total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  cartTotalContainer.innerHTML = `
        <div class="total-amount">Total: $${total.toFixed(2)}</div>
        <button class="checkout-btn" onclick="startCheckout()">
            <i class="fas fa-credit-card"></i> Checkout
        </button>
    `
}

function openCart() {
  updateCartDisplay()
  document.getElementById("cartModal").classList.add("active")
  document.body.style.overflow = "hidden"
}

function closeCart() {
  document.getElementById("cartModal").classList.remove("active")
  document.body.style.overflow = "auto"
  // Reset delivery options
  document.getElementById("deliveryOptions").style.display = "none"
  deliveryMethod = "pickup"
  selectDeliveryOption("pickup")
}

// Delivery Functions
function startCheckout() {
  if (cart.length === 0) return

  // Show delivery options
  document.getElementById("deliveryOptions").style.display = "block"

  // Update checkout button
  const cartTotalContainer = document.getElementById("cartTotal")
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  cartTotalContainer.innerHTML = `
        <div class="total-amount">Total: $${total.toFixed(2)}</div>
        <button class="checkout-btn" onclick="completeCheckout()">
            <i class="fas fa-check"></i> Complete Order
        </button>
    `
}

function selectDeliveryOption(method) {
  deliveryMethod = method

  // Update toggle buttons
  document.querySelectorAll(".delivery-toggle-btn").forEach((btn) => {
    btn.classList.remove("active")
  })

  if (method === "pickup") {
    document.querySelector(".delivery-toggle-btn:first-child").classList.add("active")
    document.getElementById("pickupInfo").classList.add("active")
    document.getElementById("deliveryForm").classList.remove("active")
  } else {
    document.querySelector(".delivery-toggle-btn:last-child").classList.add("active")
    document.getElementById("pickupInfo").classList.remove("active")
    document.getElementById("deliveryForm").classList.add("active")
  }
}

function completeCheckout() {
  // Validate delivery form if delivery is selected
  if (deliveryMethod === "delivery") {
    const name = document.getElementById("deliveryName").value
    const phone = document.getElementById("deliveryPhone").value
    const street = document.getElementById("deliveryStreet").value
    const city = document.getElementById("deliveryCity").value
    const state = document.getElementById("deliveryState").value
    const zip = document.getElementById("deliveryZip").value

    if (!name || !phone || !street || !city || !state || !zip) {
      alert("Please fill in all required delivery information.")
      return
    }
  }

  // Process the order
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const orderNumber = Math.floor(Math.random() * 1000000)

  // Show success message
  let successMessage = ""

  if (deliveryMethod === "pickup") {
    successMessage = `
            <div class="checkout-success">
                <i class="fas fa-check-circle"></i>
                <h4>Order Successful!</h4>
                <p>Order #${orderNumber}</p>
                <p>Total: $${total.toFixed(2)}</p>
                <p><strong>Pickup at:</strong> 123 Coffee Street, Downtown District</p>
                <p>Your order will be ready in 15-20 minutes.</p>
                <p>Thank you for your order!</p>
            </div>
        `
  } else {
    const name = document.getElementById("deliveryName").value
    const street = document.getElementById("deliveryStreet").value
    const city = document.getElementById("deliveryCity").value
    const state = document.getElementById("deliveryState").value
    const zip = document.getElementById("deliveryZip").value

    successMessage = `
            <div class="checkout-success">
                <i class="fas fa-check-circle"></i>
                <h4>Order Successful!</h4>
                <p>Order #${orderNumber}</p>
                <p>Total: $${total.toFixed(2)}</p>
                <p><strong>Delivery to:</strong> ${name}</p>
                <p>${street}, ${city}, ${state} ${zip}</p>
                <p>Estimated delivery time: 30-45 minutes</p>
                <p>Thank you for your order!</p>
            </div>
        `
  }

  document.getElementById("cartItems").innerHTML = successMessage
  document.getElementById("deliveryOptions").style.display = "none"

  document.getElementById("cartTotal").innerHTML = `
        <button class="checkout-btn" onclick="closeCart(); clearCart();">Continue Shopping</button>
    `
}

function clearCart() {
  cart = []
  updateCartCount()
  updateCartDisplay()
}

// Auth functions
function showAuthModal() {
  if (isLoggedIn) {
    logout()
  } else {
    showLoginModal()
  }
}

function showLoginModal() {
  document.getElementById("loginModal").classList.add("active")
  document.body.style.overflow = "hidden"
}

function showRegisterModal() {
  document.getElementById("registerModal").classList.add("active")
  document.body.style.overflow = "hidden"
}

function closeAuthModal() {
  document.getElementById("loginModal").classList.remove("active")
  document.getElementById("registerModal").classList.remove("active")
  document.body.style.overflow = "auto"

  // Clear forms and reset buttons
  document.querySelectorAll(".auth-form").forEach((form) => form.reset())
  document.querySelectorAll(".success-message").forEach((msg) => msg.classList.remove("show"))
  document.querySelectorAll(".auth-btn").forEach((btn) => {
    btn.classList.remove("loading")
    btn.disabled = false
  })
}

function switchToRegister() {
  document.getElementById("loginModal").classList.remove("active")
  document.getElementById("registerModal").classList.add("active")
}

function switchToLogin() {
  document.getElementById("registerModal").classList.remove("active")
  document.getElementById("loginModal").classList.add("active")
}

function handleLogin(event) {
  event.preventDefault()

  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value
  const loginBtn = document.getElementById("loginBtn")

  // Add loading state
  loginBtn.classList.add("loading")
  loginBtn.disabled = true

  // Simulate login process
  setTimeout(() => {
    const firstName = email.split("@")[0]
    const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1)

    currentUser = {
      name: capitalizedName,
      email: email,
      initials: capitalizedName.substring(0, 2).toUpperCase(),
    }

    isLoggedIn = true
    updateAuthUI()

    // Show success message
    document.getElementById("loginSuccess").classList.add("show")

    // Remove loading state
    loginBtn.classList.remove("loading")
    loginBtn.disabled = false

    // Close modal after delay
    setTimeout(() => {
      closeAuthModal()
    }, 2000)
  }, 1500)
}

function handleRegister(event) {
  event.preventDefault()

  const name = document.getElementById("registerName").value
  const email = document.getElementById("registerEmail").value
  const password = document.getElementById("registerPassword").value
  const confirmPassword = document.getElementById("confirmPassword").value
  const registerBtn = document.getElementById("registerBtn")

  if (password !== confirmPassword) {
    alert("Passwords do not match!")
    return
  }

  // Add loading state
  registerBtn.classList.add("loading")
  registerBtn.disabled = true

  // Simulate registration process
  setTimeout(() => {
    currentUser = {
      name: name,
      email: email,
      initials: name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2),
    }

    isLoggedIn = true
    updateAuthUI()

    // Show success message
    document.getElementById("registerSuccess").classList.add("show")

    // Remove loading state
    registerBtn.classList.remove("loading")
    registerBtn.disabled = false

    // Close modal after delay
    setTimeout(() => {
      closeAuthModal()
    }, 2000)
  }, 1500)
}

function updateAuthUI() {
  const profileText = document.getElementById("profileText")
  const profileAvatar = document.getElementById("profileAvatar")

  if (isLoggedIn && currentUser) {
    profileText.textContent = currentUser.name.split(" ")[0]
    profileAvatar.innerHTML = currentUser.initials
  } else {
    profileText.textContent = "Sign In"
    profileAvatar.innerHTML = '<i class="fas fa-user"></i>'
  }
}

function logout() {
  isLoggedIn = false
  currentUser = null
  updateAuthUI()
  closeAuthModal()

  showNotification("Successfully signed out!", "success")
}

// Utility function for notifications
function showNotification(message, type = "success") {
  const notification = document.createElement("div")
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "success" ? "linear-gradient(135deg, #10B981, #059669)" : "linear-gradient(135deg, #EF4444, #DC2626)"};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 600;
        z-index: 9999;
        box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
        animation: slideIn 0.3s ease;
    `
  notification.innerHTML = `<i class="fas fa-check-circle" style="margin-right: 8px;"></i>${message}`
  document.body.appendChild(notification)

  setTimeout(() => {
    notification.remove()
  }, 3000)
}

// Event listeners
document.addEventListener("click", (event) => {
  const cartModal = document.getElementById("cartModal")
  const loginModal = document.getElementById("loginModal")
  const registerModal = document.getElementById("registerModal")
  const productModal = document.getElementById("productModal")

  // Close modals when clicking outside
  if (event.target === cartModal) {
    closeCart()
  }
  if (event.target === loginModal || event.target === registerModal) {
    closeAuthModal()
  }
  if (event.target === productModal) {
    closeProductModal()
  }
})

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount()
  updateAuthUI()

  // Show home section by default
  showSection("home")
})

// Add CSS animation for notifications
const style = document.createElement("style")
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`
document.head.appendChild(style)


//loc

