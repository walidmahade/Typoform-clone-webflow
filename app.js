function getLetterFromNumber(num) {
  const alphabets = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
  return alphabets[parseInt(num)];
}

$(function () {
  // DOM elements
  const heroImage = $(".lv-form_hero-image");
  const goNextBtn = $(".swiper-nav.lv-form_next");
  const goPrevBtn = $(".swiper-nav.lv-form_prev");
  let scrolling = false;

  /**
   * Focus on first input
   * Scroll to top on page load
   */
  const $lvFormFields = $(".lv-form_field");
  $lvFormFields.first().find("input").focus().select();
  $("html, body").animate({ scrollTop: 0 }, 0);

  /**
   * -------------------------------------------------------------------
   * Submit button loading animation
   */
  const submitBtn = $(".lv-form_btn-submit");
  submitBtn.on("click", function (event) {
    submitBtn.text("Sending ...");
  });

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
    allowTouchMove: false,
    observer: true,
  });

  /*if ($(window).width() < 600) {
    $(window).on("resize", function () {
      let height = $(window).height();
      let width = $(window).width();
      $(".swiper-container, .swiper-slide").height(height);
      $(".swiper-container, .swiper-slide").width(width);
      //Add reInit, because jQuery's resize event handler may occur earlier than Swiper's one
      lvFormSlider.update();
      lvFormSlider.updateSlides();
    });
    $(window).resize();
  }
  */

  // ------------------------------------------------------ Slide navigation helpers

  function goToPrevSlide() {
    lvFormSlider.slidePrev();
  }

  function goToNextSlide() {
    const errors = activeSlideHasErrors();
    if (!errors) {
      lvFormSlider.slideNext();
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
    // field not found
    if (!targetInput.length) {
      console.warn("Input not found in active slide");
      return true;
    }

    // field is optional
    if (targetInput.data("required") === false || targetInput.data("required") === "false") {
      return false;
    }

    const okBtn = activeSlider.find(".lv-form_ok-btn").first();

    // value is empty
    if (targetInput.val() === "" || targetInput.val() === null) {
      console.log("Trigger error: EMPTY_VALUE");
      triggerErrorMessage(okBtn);
      return true;
    }

    // value is email
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
    // conditions structure: "yes=8 \n no=9"
    const conditionsObj = {};
    conditions.split("\n").map((c) => (conditionsObj[c.split("=")[0]] = c.split("=")[1]));
    const newSlideSerial = conditionsObj[inputVal];

    if (newSlideSerial) {
      const slideSelector = $(`.lv-custom-form [data-serial="${newSlideSerial}"]`);
      if (slideSelector.length) {
        console.log("SLIDE ALREADY EXISTS, NO NEED TO PUSH NEW");
      } else {
        console.log("Pushing new SLIDE ---------: ", newSlideSerial);
        // clone jquery object, because swiper will cut paste the dom element
        const newSlide = $(`[data-serial='${newSlideSerial}']`).clone();
        lvFormSlider.addSlide(lvFormSlider.activeIndex + 1, newSlide);
        lvFormSlider.update();
        lvFormSlider.updateSlides();
      }
      goToNextSlide();
    } else {
      console.log("NO MATCHING CONDITION TARGET FOUND, REMOVING EXTRA");
      // remove extra slides, if any
      const extraSlideSerial = Object.values(conditionsObj)[0];
      // remove dom element with serial of first value
      $(`.lv-custom-form [data-serial="${extraSlideSerial}"]`).remove();
      lvFormSlider.update();
      lvFormSlider.updateSlides();
      // go next
      goToNextSlide();
    }
  }

  // on slide change actions
  lvFormSlider.on("slideChange", function (event) {
    // show or hide hero image based on slide
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
  $(".lv-form_wrapper").on("click", ".lv-form_ok-btn", function () {
    // go next
    goToNextSlide();
  });

  // on input change remove errors
  function handleInput(event) {
    scrolling = false;
    removeErrorMessage($(event.target));
  }

  $(".lv-form_input").on("input", handleInput);
  $(".lv-form_wrapper").on("input", "input[type='text']", handleInput);
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

    // animate
    runFlashAnimation($this);

    const conditions = targetInput.data("conditions");

    if (conditions) {
      setTimeout(() => goToSlideConditionally(conditions, targetInput.val()), 850);
      return;
    }

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
