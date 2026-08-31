const SAMPLES = {
  raw: `[00:04] uh so the the patient he ah presented on the on the fourteenth of march with with what he described as um sharp pain lower back yeah
[00:19] SPEAKER 2: sorry can you can you repeat the date
[00:21] fourteenth of of march two thousand and twenty four ah and and there was no there was no prior imaging done`,

  clean: `[00:04] DR HALE: The patient presented on 14 March 2024 with what he described as sharp lower back pain.
[00:19] MS OKAFOR: Sorry, could you repeat the date?
[00:21] DR HALE: 14 March 2024 — and there was no prior imaging undertaken.`,
};

const SPEED = {
  standard: {
    label: "3-Day Standard",
    eta: "Within 3 business days",
    mult: 1,
  },

  "24": {
    label: "24 Hours",
    eta: "Within 24 hours",
    mult: 1.35,
  },

  urgent: {
    label: "Urgent Overnight",
    eta: "Next morning (overnight)",
    mult: 1.75,
  },
};


/* =========================================================
   HELPER
========================================================= */

const $ = (id) => document.getElementById(id);


/* =========================================================
   CURRENT YEAR
========================================================= */

const yearElement = $("yr");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

const burger = $("burger");
const links = $("navlinks");

burger?.addEventListener("click", () => {
  const isOpen = links?.classList.toggle("open");

  burger?.setAttribute(
    "aria-expanded",
    String(!!isOpen)
  );

  burger?.setAttribute(
    "aria-label",
    isOpen ? "Close navigation" : "Open navigation"
  );
});


/*
   Close the mobile menu when a navigation link
   is clicked.
*/

links?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {

    links.classList.remove("open");

    burger?.setAttribute(
      "aria-expanded",
      "false"
    );

    burger?.setAttribute(
      "aria-label",
      "Open navigation"
    );

  });
});


/*
   Close mobile menu when clicking outside it.
*/

document.addEventListener("click", (event) => {

  if (!links || !burger) return;

  const clickedInsideNav =
    links.contains(event.target) ||
    burger.contains(event.target);

  if (!clickedInsideNav) {

    links.classList.remove("open");

    burger.setAttribute(
      "aria-expanded",
      "false"
    );

    burger.setAttribute(
      "aria-label",
      "Open navigation"
    );
  }

});


/*
   Close mobile navigation when pressing Escape.
*/

document.addEventListener("keydown", (event) => {

  if (event.key === "Escape") {

    links?.classList.remove("open");

    burger?.setAttribute(
      "aria-expanded",
      "false"
    );

    burger?.setAttribute(
      "aria-label",
      "Open navigation"
    );

  }

});


/* =========================================================
   QUALITY SAMPLE TOGGLE
========================================================= */

const sampleBox = $("sampleBox");

if (sampleBox) {
  sampleBox.textContent = SAMPLES.raw;
}


document.querySelectorAll(".tbtn").forEach((button) => {

  button.addEventListener("click", () => {

    /*
       Remove active state from all buttons.
    */

    document
      .querySelectorAll(".tbtn")
      .forEach((btn) => {
        btn.classList.remove("active");
      });


    /*
       Activate clicked button.
    */

    button.classList.add("active");


    /*
       Update sample.
    */

    const sampleType = button.dataset.sample;

    if (sampleBox && SAMPLES[sampleType]) {
      sampleBox.textContent = SAMPLES[sampleType];
    }

  });

});


/* =========================================================
   QUOTE ESTIMATOR
========================================================= */

const mins = $("mins");
const minsNum = $("minsNum");
const speed = $("speed");
const atype = $("atype");


function updateEstimator() {

  /*
     Get minutes from number input.
  */

  let m = Number(minsNum?.value || 30);

  /*
     Prevent invalid values.
  */

  if (!Number.isFinite(m)) {
    m = 30;
  }

  m = Math.max(1, m);


  /*
     Get turnaround option.
  */

  const selectedSpeed =
    SPEED[speed?.value] || SPEED.standard;


  /*
     Determine whether audio is complex.
  */

  const complex =
    atype?.value === "multi";


  /*
     Base price per minute.
  */

  const base = complex ? 3.1 : 2.0;


  /*
     Calculate estimated price.
  */

  const low =
    m *
    base *
    selectedSpeed.mult;

  const high =
    low * 1.28;


  /*
     Update displayed minutes.
  */

  if ($("minsLabel")) {
    $("minsLabel").textContent = m;
  }

  if ($("oMins")) {
    $("oMins").textContent = `${m} min`;
  }


  /*
     Update service description.
  */

  if ($("oService")) {

    $("oService").textContent =
      `${selectedSpeed.label} · ${
        complex
          ? "Multi-speaker"
          : "Single speaker"
      }`;

  }


  /*
     Calculate estimated delivery.
  */

  const days =
    selectedSpeed.mult === 1
      ? Math.max(1, Math.ceil(m / 120)) + 2
      : 0;


  if ($("oTime")) {

    $("oTime").textContent =
      selectedSpeed.mult === 1
        ? `Within ${days} business days`
        : selectedSpeed.eta;

  }


  /*
     Display estimated price.
  */

  if ($("oPrice")) {

    $("oPrice").textContent =
      `$${Math.round(low)} – $${Math.round(high)}`;

  }

}


/*
   Range slider changes.
*/

mins?.addEventListener("input", () => {

  if (minsNum) {
    minsNum.value = mins.value;
  }

  updateEstimator();

});


/*
   Number input changes.
*/

minsNum?.addEventListener("input", () => {

  let value =
    Number(minsNum.value) || 5;

  /*
     Keep range slider within
     its supported limits.
  */

  value =
    Math.min(
      480,
      Math.max(5, value)
    );


  minsNum.value = value;

  if (mins) {
    mins.value = String(value);
  }

  updateEstimator();

});


/*
   Turnaround change.
*/

speed?.addEventListener(
  "change",
  updateEstimator
);


/*
   Audio type change.
*/

atype?.addEventListener(
  "change",
  updateEstimator
);


/*
   Run estimator immediately.
*/

updateEstimator();


/* =========================================================
   BOOK THIS SERVICE
========================================================= */

$("bookBtn")?.addEventListener(
  "click",
  () => {

    const selectedSpeed =
      SPEED[speed?.value] ||
      SPEED.standard;


    /*
       Set urgency in contact form.
    */

    const urgency =
      $("urgency");

    if (urgency) {

      urgency.value =
        selectedSpeed.label === "3-Day Standard"
          ? "Standard"
          : selectedSpeed.label === "24 Hours"
          ? "24-Hour"
          : "Urgent Overnight";

    }


    /*
       Create booking message.
    */

    const message =
      $("message");

    if (message) {

      const audioType =
        atype?.value === "multi"
          ? "multi-speaker / court / poor quality"
          : "single speaker dictation";


      message.value =
        `Booking request: ${
          minsNum?.value || 30
        } minutes of ${
          audioType
        } audio, ${
          selectedSpeed.label
        } turnaround. Estimated ${
          $("oPrice")?.textContent || ""
        } (ex GST).`;

    }


    /*
       Scroll smoothly to contact section.
    */

    const contact =
      $("contact");

    if (contact) {

      contact.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

    }


    /*
       Focus name field after scrolling.
    */

    setTimeout(() => {

      $("name")?.focus();

    }, 600);

  }
);


/* =========================================================
   FILE UPLOAD AREA
========================================================= */

const fileInput = $("file");
const dropArea = $("drop");
const fileName = $("fileName");


/*
   Clicking the drop zone opens
   the native file selector.
*/

dropArea?.addEventListener(
  "click",
  () => {
    fileInput?.click();
  }
);


/*
   Keyboard accessibility for
   the file upload area.
*/

dropArea?.setAttribute(
  "tabindex",
  "0"
);

dropArea?.setAttribute(
  "role",
  "button"
);

dropArea?.setAttribute(
  "aria-label",
  "Select an audio file"
);


dropArea?.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Enter" ||
      event.key === " "
    ) {

      event.preventDefault();

      fileInput?.click();

    }

  }
);


/*
   Show selected filename.
*/

fileInput?.addEventListener(
  "change",
  () => {

    const file =
      fileInput.files?.[0];

    if (fileName) {

      fileName.textContent =
        file
          ? `Selected: ${file.name}`
          : "";

    }

  }
);


/* =========================================================
   DRAG & DROP FILE SUPPORT
========================================================= */

dropArea?.addEventListener(
  "dragover",
  (event) => {

    event.preventDefault();

    dropArea.classList.add(
      "dragging"
    );

  }
);


dropArea?.addEventListener(
  "dragleave",
  () => {

    dropArea.classList.remove(
      "dragging"
    );

  }
);


dropArea?.addEventListener(
  "drop",
  (event) => {

    event.preventDefault();

    dropArea.classList.remove(
      "dragging"
    );


    const files =
      event.dataTransfer?.files;


    if (
      !files ||
      files.length === 0
    ) {
      return;
    }


    /*
       Assign dropped files to
       the hidden input where supported.
    */

    try {

      const dataTransfer =
        new DataTransfer();

      dataTransfer.items.add(
        files[0]
      );

      if (fileInput) {
        fileInput.files =
          dataTransfer.files;
      }

    } catch (error) {

      console.warn(
        "Unable to assign dropped file.",
        error
      );

    }


    /*
       Display filename.
    */

    if (fileName) {

      fileName.textContent =
        `Selected: ${files[0].name}`;

    }

  }
);


/* =========================================================
   CONTACT FORM
========================================================= */

$("quoteForm")?.addEventListener(
  "submit",
  (event) => {

    event.preventDefault();


    const name =
      $("name");

    const email =
      $("email");


    /*
       Validate required fields.
    */

    if (
      !name ||
      !email
    ) {
      return;
    }


    const nameValue =
      name.value.trim();

    const emailValue =
      email.value.trim();


    /*
       Basic email validation.
    */

    const validEmail =
      /^\S+@\S+\.\S+$/.test(
        emailValue
      );


    if (
      !nameValue ||
      !validEmail
    ) {

      alert(
        "Please enter your name and a valid email address."
      );

      if (!nameValue) {
        name.focus();
      } else {
        email.focus();
      }

      return;

    }


    /*
       Show success message.
    */

    const formOk =
      $("formOk");

    if (formOk) {

      formOk.style.display =
        "block";

    }


    /*
       Build email content.
    */

    const organisation =
      $("org")?.value || "";

    const urgency =
      $("urgency")?.value || "";

    const message =
      $("message")?.value || "";


    const body =
      encodeURIComponent(
        `Name: ${nameValue}
Email: ${emailValue}
Organisation: ${organisation}
Urgency: ${urgency}

${message}`
      );


    /*
       Open user's email client.
    */

    const subject =
      encodeURIComponent(
        `Transcription enquiry — ${nameValue}`
      );


    window.location.href =
      `mailto:taraayers254@gmail.com?subject=${subject}&body=${body}`;

  }
);


/* =========================================================
   HEADER SCROLL EFFECT
========================================================= */

const navigation =
  document.querySelector(".ta-nav");


window.addEventListener(
  "scroll",
  () => {

    if (!navigation) return;


    if (window.scrollY > 20) {

      navigation.classList.add(
        "nav-scrolled"
      );

    } else {

      navigation.classList.remove(
        "nav-scrolled"
      );

    }

  },
  {
    passive: true,
  }
);


/* =========================================================
   PREVENT EMPTY HASH JUMPS
========================================================= */

document
  .querySelectorAll('a[href="#"]')
  .forEach((link) => {

    link.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
      }
    );

  });