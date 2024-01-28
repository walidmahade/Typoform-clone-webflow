function getLetterFromNumber(num) {
  const alphabets = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
  return alphabets[parseInt(num)];
}

$(function () {
  console.log("Loading local script -----------");

  /**
   * Focus on first input
   * Scroll to top on page load
   */
  const $lvFormFields = $(".lv-form_field");
  $lvFormFields.first().find("input").focus().select();
  $("html, body").animate({ scrollTop: 0 }, 0);

  // -------------------------------------------------------  validation helpers
  function inputIsEmail($target) {
    return $target.attr("is-email") === "true";
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function showOkButton($target) {
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

  /**
   * -------------------------------------------------------------------------------
   * Start scrolling fucntion
   * @type {boolean}
   */
  let scrolling = false;

  // Function to check if an element is in the viewport
  $.fn.isInViewport = function () {
    let elementTop = $(this).offset().top;
    let elementBottom = elementTop + $(this).outerHeight();
    let viewportTop = $(window).scrollTop();
    let viewportBottom = viewportTop + $(window).height();
    return elementBottom > viewportTop && elementTop < viewportBottom;
  };

  // Function to handle scroll events
  function handleScroll(event) {
    // let hasErrors = false;
    console.log("scrolling");
    console.log("scrolling: ", scrolling);

    if (!scrolling) {
      scrolling = true;

      // Determine scroll direction
      const direction = event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0 ? "up" : "down";

      // Get current section
      let currentSection = "";
      let currentSectionInput = "";
      let currentSectionOkButton = "";
      $lvFormFields.each(function () {
        if ($(this).isInViewport()) {
          currentSection = $(this).data("target");
          currentSectionInput = $(this).find("input").first();
          currentSectionOkButton = $(this).find(".lv-form_ok-btn").first();
        }
      });
      // Get the target section based on scroll direction
      const targetSection = direction === "up" ? getPrevSection(currentSection) : getNextSection(currentSection);

      // if direction is up, no need to check for errors
      if (direction === "up") {
        goToSection(targetSection);
      }

      // handle email field error/validation
      if (inputIsEmail(currentSectionInput)) {
        if (!isValidEmail(currentSectionInput.val())) {
          triggerErrorMessage(currentSectionOkButton);
          scrolling = false;
          return false;
        }
      }

      // directions is "down", check for errors
      if (currentSectionInput.length && currentSectionInput.val() === "") {
        // hasErrors = true;
        // show errors
        triggerErrorMessage(currentSectionOkButton);
        console.log("Stopped scrolling because of errors");
        scrolling = false;
      } else {
        // Scroll to the target section with animation
        goToSection(targetSection);
      }
    }
  }

  function goToSection(targetSection) {
    $("html, body").animate(
      {
        scrollTop: $('[data-target="' + targetSection + '"]').offset().top,
      },
      300,
      function () {
        scrolling = false;
      },
    );
  }

  // Function to get the previous section
  function getPrevSection(currentSection) {
    const prevSection = $('[data-target="' + currentSection + '"]').prev(".lv-form_field");
    return prevSection.length ? prevSection.data("target") : currentSection;
  }

  // Function to get the next section
  function getNextSection(currentSection) {
    const nextSection = $('[data-target="' + currentSection + '"]').next(".lv-form_field");
    return nextSection.length ? nextSection.data("target") : currentSection;
  }

  // Attach the handleScroll function to the mousewheel event
  $(window).bind("mousewheel", handleScroll);
  $(document).on("touchmove", handleScroll);

  // ------------------------------------------------------------------------ END scroll related code

  /**
   * handle button click: go to next section
   */

  // handler
  $(".lv-form_ok-btn").click(function () {
    let hasErrors = false;
    const $this = $(this);

    // validation
    const targetInputEl = $(this).closest(".lv-form_content").find("input");
    const inputVal = targetInputEl.val();
    if (targetInputEl.length && inputVal === "") {
      hasErrors = true;
      triggerErrorMessage($this);
    }

    if (inputIsEmail(targetInputEl)) {
      if (!isValidEmail(inputVal)) {
        hasErrors = true;
        triggerErrorMessage($this);
      }
    }

    // go to next section
    if (!hasErrors) {
      const targetSection = $(this).closest(".lv-form_field").next().data("target");
      goToSection(targetSection);
    }
  });

  // on input change remove errors
  $(".lv-form_input").on("input", function () {
    showOkButton($(this));
    // if ($(this).val().trim() !== "") {
    // } else {
    // }
  });
  // $(".lv-form_input").keyup(function () {});
  // ----------------------------------------------------------------- END validation code

  /**
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

    const siblingInput = $this.parent(".lv-form_multichoice").siblings(".lv-form_input");

    if (siblingInput.length) {
      console.log("prev selector: ", siblingInput);
      siblingInput.val($this.find(".cta-form-check-text").first().text());
    } else {
      console.log("input not found");
    }

    // animate
    runFlashAnimation($this);
    // remove error message and show ok button
    showOkButton($(this));
    const targetSection = $(this).closest(".lv-form_field").next().data("target");
    setTimeout(() => goToSection(targetSection), 850);
  });

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

/*
<div class="cta-form_checkboxes_wrapper">
  <div class="cta-form_checkbox">
    <div class="cta-form-check" style="">N</div>
    <label for="" class="cta-form-check-text">No</label>
    <div class="cta-form-check-mark" style="display: none">
      <svg height="13" width="16" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M14.293.293l1.414 1.414L5 12.414.293 7.707l1.414-1.414L5 9.586z"
          fill="white"
        ></path>
      </svg>
    </div>
  </div>
</div>
 */
