function getLetterFromNumber(num) {
  const alphabets = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
  return alphabets[parseInt(num)];
}

$(function () {
  console.log("Loading local script -----------");

  // DOM elements
  const heroImage = $(".lv-form_hero-image");
  const goNextBtn = $(".swiper-nav.lv-form_next");
  const goPrevBtn = $(".swiper-nav.lv-form_prev");
  let scrolling = false;
  let conditionUsed = false;

  /**
   * Focus on first input
   * Scroll to top on page load
   */
  const $lvFormFields = $(".lv-form_field");
  $lvFormFields.first().find("input").focus().select();
  $("html, body").animate({ scrollTop: 0 }, 0);

  // Function to check if an element is in the viewport
  // $.fn.isInViewport = function () {
  //   let elementTop = $(this).offset().top;
  //   let elementBottom = elementTop + $(this).outerHeight();
  //   let viewportTop = $(window).scrollTop();
  //   let viewportBottom = viewportTop + $(window).height();
  //   return elementBottom > viewportTop && elementTop < viewportBottom;
  // };

  /**
   * -------------------------------------------------------------------
   * swiper slider
   * for form navigation
   * with mobile swipe support
   */
  const lvFormSlider = new Swiper(".swiper", {
    // Optional parameters
    direction: "vertical",
    loop: false,
    slidesPerView: 1,
    height: window.innerHeight,
    allowTouchMove: true,
    // If we need pagination
    pagination: {
      el: ".swiper-pagination",
    },
    breakpoints: {
      1333: {
        allowTouchMove: false,
      },
    },
  });

  // ------------------------------------------------------ Slide navigation helpers
  function goToSlide(slider, newIndex) {
    slider.slideTo(newIndex);
  }

  function goToPrevSlide() {
    const activeIndex = lvFormSlider.activeIndex;
    if (activeIndex === 4 && conditionUsed) {
      lvFormSlider.slideTo(activeIndex - 2);
    } else lvFormSlider.slidePrev();
  }

  function goToNextSlide() {
    const errors = activeSlideHasErrors();
    const activeIndex = lvFormSlider.activeIndex;

    if (!errors) {
      if (activeIndex === 2 && conditionUsed) {
        lvFormSlider.slideTo(activeIndex + 2);
      } else lvFormSlider.slideNext();
    }
  }

  // -------------------------------------------------------  validation helpers
  function inputIsEmail($target) {
    return $target.attr("is-email") === "true";
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function removeErrorMessage($target) {
    const $targetSectionBtnWrapper = $target.closest(".lv-form_content");
    // show ok button
    $targetSectionBtnWrapper.find(".lv-form_ok-btn").first().css({ opacity: 1 });
    // hide errors
    $targetSectionBtnWrapper.find(".lv-form_error").first().removeClass("is-visible");
  }

  function triggerErrorMessage($target) {
    // hide ok button
    $target.css({ opacity: 0 });
    // show errors
    $target.next(".lv-form_error").addClass("is-visible");
  }

  function activeSlideHasErrors() {
    const activeSlider = $(".lv-form_field.swiper-slide-active");
    const targetInput = activeSlider.find("input");

    if (!targetInput.length) {
      console.warn("Input not found in active slide");
      return true;
    }

    const okBtn = activeSlider.find(".lv-form_ok-btn").first();

    if (targetInput.val() === "" || targetInput.val() === null) {
      console.log("Trigger error: EMPTY_VALUE");
      triggerErrorMessage(okBtn);
      return true;
    }

    if (inputIsEmail(targetInput)) {
      console.log("Trigger error: INVALID_EMAIL");
      if (!isValidEmail(targetInput.val())) {
        triggerErrorMessage(okBtn);
        return true;
      }
    }

    return false;
  }

  function goToSlideConditionally(conditions, inputVal) {
    const conditionsObj = {};
    conditions.split("\n").map((c) => (conditionsObj[c.split("=")[0]] = c.split("=")[1]));
    const targetSlideSerial = conditionsObj[inputVal];

    if (targetSlideSerial) {
      // targetSlideSerial starts from 1, slide index starts from 0
      // to match both need to subtract 1
      conditionUsed = true;
      goToSlide(lvFormSlider, Number(targetSlideSerial) - 1);
    } else {
      console.log("NO MATCHING CONDITION TARGET FOUND");
      conditionUsed = false;
      goToNextSlide();
    }
  }

  // on slide change actions
  lvFormSlider.on("slideChange", function (event) {
    // show of hide hero image based on slide
    if (event.activeIndex > 0) {
      heroImage.hide(100);
    } else {
      heroImage.show(50);
    }
  });

  lvFormSlider.on("slideChangeTransitionEnd", function () {
    console.log("TRANSITION_END");
    scrolling = false;
  });

  goNextBtn.on("click", function (event) {
    console.log("Trying to Go to next page");
    event.preventDefault();
    // go next
    goToNextSlide();
  });

  goPrevBtn.on("click", function (event) {
    console.log("Trying Go to previous page");
    event.preventDefault();
    goToPrevSlide();
  });
  // ----------------------------- END swiper code

  // ---------------------------------------------------- Function to handle scroll events on desktop
  function handleScroll(event) {
    console.log("SCROLLING: ", scrolling);

    if (!scrolling) {
      scrolling = true;

      // Determine scroll direction
      const direction = event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0 ? "up" : "down";
      const activeIndex = lvFormSlider.activeIndex;

      if (direction === "up") {
        // if direction is up, no need to check for errors
        goToPrevSlide();
      } else {
        // if direction is down
        console.log("Running scroll down else block");
        // go next
        goToNextSlide();
      }
    }
  }

  // Attach the handleScroll function to the mousewheel event
  $(document).on("mousewheel DOMMouseScroll", handleScroll);

  // ------------------------------------------------------------------------ END scroll related code

  /**
   * handle button click: go to next section
   */

  // handler
  $(".lv-form_ok-btn").on("click", function () {
    // go next
    goToNextSlide();
  });

  // on input change remove errors
  $(".lv-form_input").on("input", function () {
    scrolling = false;
    removeErrorMessage($(this));
  });
  // ----------------------------------------------------------------- END validation code

  /**
   * -------------------------------------------------------------------------------
   * init multiple choice fields
   * @type {*|jQuery|HTMLElement}
   */
  const multipleChoicesWrappers = $(".lv-form_multichoice");

  function flashElement($target) {
    $target.fadeOut(150, function () {
      $(this).fadeIn(150);
    });
  }
  function runFlashAnimation($target) {
    // Trigger the flash animation three times with a delay of 100 milliseconds between each flash
    setTimeout(() => flashElement($target), 0);
    setTimeout(() => flashElement($target), 200);
    setTimeout(() => flashElement($target), 300);
    setTimeout(() => flashElement($target), 400);
  }

  // attack on click handler
  multipleChoicesWrappers.on("click", ".cta-form_checkbox", function () {
    console.log("Clicked multiple choices");
    const $this = $(this);
    $this.addClass("is-checked");
    $this.siblings(".cta-form_checkbox").removeClass("is-checked");

    const targetInput = $this.parent(".lv-form_multichoice").siblings(".lv-form_input");

    if (targetInput.length) {
      console.log("prev selector: ", targetInput);
      targetInput.val($this.find(".cta-form-check-text").first().text());
    } else {
      console.error("input not found");
    }

    const conditions = targetInput.data("conditions");

    if (conditions) {
      goToSlideConditionally(conditions, targetInput.val());
      return;
    }

    // animate
    runFlashAnimation($this);

    // remove error message and show ok button
    removeErrorMessage($(this));

    // go to next slide
    const okBtn = $this.closest(".lv-form_content").find(".lv-form_ok-btn").first();
    setTimeout(() => okBtn.trigger("click"), 850);
  });

  // prepare multiple choice options
  if (multipleChoicesWrappers.length) {
    multipleChoicesWrappers.each(function () {
      const $this = $(this);
      const optionsArr = $this.attr("data-options").split("\n");
      let optionsHtml = "";
      if (optionsArr.length) {
        optionsArr.map(function (opStr, num) {
          optionsHtml += `
          <div class="cta-form_checkbox">
            <div class="cta-form-check">${opStr.toLowerCase() === "no" ? "N" : opStr.toLowerCase() === "yes" ? "Y" : getLetterFromNumber(num)}</div>
            <div class="cta-form-check-text">${opStr}</div>
          </div>`;
        });
      }
      $this.html(optionsHtml);
    });
  }
});
