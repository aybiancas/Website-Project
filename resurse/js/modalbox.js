document.addEventListener("DOMContentLoaded", () => {
    const openButtons = document.querySelectorAll('.open-modal');
    openButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const prodId = btn.getAttribute('data-prod-id');
            const modal = document.querySelector(`.modal-container[data-prod-id="${prodId}"]`);
            if (modal) modal.classList.remove('hidden');
        });
    });

    const modals = document.querySelectorAll('.modal-container');

    // modals.forEach(function (modal) {
    //     modal.addEventListener('shown.bs.modal', function () {
    //         var carouselEl = modal.querySelector('.carousel');
    //         if (!carouselEl) return;
    //         var carouselInstance = bootstrap.Carousel.getInstance(carouselEl);
    //         if (!carouselInstance) return;
    //         if (carouselInstance._isSliding) {
    //             var slidEvent = new Event('slid.bs.carousel', { bubbles: true, cancelable: true });
    //             carouselEl.dispatchEvent(slidEvent);
    //         }
    //     })
    // });

    modals.forEach(modal => {

        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');

        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        overlay.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    });
});