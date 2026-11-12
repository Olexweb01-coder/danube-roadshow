"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { BROKER, COMMUNITY_URL, EVENT, dataHolders, whatsappLink } from "@/config/event";
import { PROPERTIES } from "@/config/properties";
import {
  BUDGETS,
  BUDGET_OTHER,
  BUYING,
  HEARD_FRIEND,
  HEARD_FROM,
  HEARD_OTHER,
  LOCATIONS,
  READY,
  SCREENS,
  SCREEN_ORDER,
  normalise,
  validate,
  type FieldErrors,
  type RegistrationInput,
  type Screen,
} from "@/lib/registration";
import { SCROLL_LOCK, SCROLL_UNLOCK } from "./SmoothScroll";
import { WhatsAppIcon } from "./Icons";
import RevealText from "./motion/RevealText";

type Step = "form" | "community" | "done";
/** `day` is only present on passes saved by the earlier version of the form. */
type Saved = { id: string; firstName: string; joined: boolean; day?: string };

const STORAGE_KEY = "danube-roadshow-registration";
const EASE = [0.22, 1, 0.36, 1] as const;
/** Marks the history entry added while the pop-up is open, so Back closes it. */
const HISTORY_FLAG = "danubeRsvp";

function readSaved(): Saved | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    return typeof v?.id === "string" ? (v as Saved) : null;
  } catch {
    return null;
  }
}
function writeSaved(v: Saved | null) {
  try {
    if (v) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* Private mode: the flow still works for this visit. */
  }
}

const historyFlagged = () => !!(window.history.state as Record<string, unknown> | null)?.[HISTORY_FLAG];

/** Text inputs use f-name; choice groups use f-name-0 for their first option. */
function focusField(name: keyof RegistrationInput) {
  const el =
    document.getElementById(`f-${name}`) ||
    document.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`) ||
    document.getElementById(`f-${name}-0`);
  el?.focus();
}

function Field({
  name,
  label,
  error,
  full,
  children,
}: {
  name: keyof RegistrationInput;
  label: string;
  error?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`field${full ? " field--full" : ""}`} data-invalid={error ? "true" : undefined}>
      <label className="field__label" htmlFor={`f-${name}`}>
        {label}
      </label>
      {children}
      {error && (
        <span className="field__error" id={`f-${name}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

/** One-tap answers: real radio buttons, styled as rows. */
function Choices({
  name,
  options,
  labelledBy,
  label,
  error,
  compact,
  onPick,
}: {
  name: keyof RegistrationInput;
  options: readonly string[];
  labelledBy?: string;
  label?: string;
  error?: string;
  compact?: boolean;
  onPick: (value: string) => void;
}) {
  return (
    <fieldset
      className={`choices field--full${compact ? " choices--compact" : ""}`}
      aria-labelledby={labelledBy}
      aria-describedby={error ? `f-${name}-error` : undefined}
      data-invalid={error ? "true" : undefined}
    >
      {label && <legend className="field__label choices__legend">{label}</legend>}
      <div className="choices__list">
        {options.map((o, i) => (
          <label className="choice" key={o}>
            <input
              id={`f-${name}-${i}`}
              type="radio"
              name={name}
              value={o}
              aria-invalid={!!error}
              onChange={() => onPick(o)}
            />
            <span>{o}</span>
          </label>
        ))}
      </div>
      {error && (
        <span className="field__error" id={`f-${name}-error`} role="alert">
          {error}
        </span>
      )}
    </fieldset>
  );
}

const SCREEN_LABEL: Record<Screen, string> = {
  details: "Your details",
  budget: "Question 1 of 3",
  buying: "Question 2 of 3",
  ready: "Question 3 of 3",
};

export default function Register() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [screen, setScreen] = useState<Screen>("details");
  const [saved, setSaved] = useState<Saved | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [alert, setAlert] = useState("");
  const [sending, setSending] = useState(false);
  const [budget, setBudget] = useState("");
  const [heard, setHeard] = useState("");
  const [project, setProject] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const headings = useRef<Partial<Record<string, HTMLElement | null>>>({});
  const pressedOnBackdrop = useRef(false);

  const view = step === "form" ? screen : step;
  // Shown while any answer is highlighted, and gone as soon as the last one is fixed.
  // `alert` is kept for problems that aren't about one field (server down, offline).
  const fieldAlert = Object.values(errors).some(Boolean) ? "Check the highlighted answers." : "";
  const message = alert || fieldAlert;

  // Resume an earlier visit: someone who registered but never joined the
  // community goes back to the community step when they open the form.
  useEffect(() => {
    const s = readSaved();
    if (s) {
      setSaved(s);
      setStep(s.joined ? "done" : "community");
    }
    // A reload while the pop-up was open leaves its history marker behind.
    if (historyFlagged()) {
      window.history.replaceState({ ...window.history.state, [HISTORY_FLAG]: false }, "");
    }
  }, []);

  const openForm = useCallback((fromProject?: string) => {
    if (fromProject) setProject(fromProject);
    setOpen(true);
    if (!historyFlagged()) window.history.pushState({ [HISTORY_FLAG]: true }, "");
  }, []);

  const closeForm = useCallback(() => {
    // Going back removes the entry added on open; popstate then closes the pop-up.
    if (historyFlagged()) window.history.back();
    else setOpen(false);
  }, []);

  // Every "Reserve my seat" link on the page opens the pop-up instead of scrolling.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.('a[href="#register"]');
      if (!link) return;
      e.preventDefault();
      e.stopPropagation(); // keeps the smooth-scroll library from also scrolling to the section
      const panelId = link.closest("article.panel")?.getAttribute("aria-labelledby")?.replace(/^project-/, "");
      openForm(PROPERTIES.find((p) => p.id === panelId)?.name);
    };
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, [openForm]);

  // Back (and Forward) close and reopen the pop-up.
  useEffect(() => {
    const onPop = () => setOpen(historyFlagged());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Keep the <dialog> in step with `open`, and pause the page behind it.
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      document.documentElement.classList.add("rsvp-open");
      window.dispatchEvent(new Event(SCROLL_LOCK));
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onCancel = (e: Event) => {
      // Escape, or the Android back gesture: close through history like the X button.
      e.preventDefault();
      closeForm();
    };
    const onClose = () => {
      document.documentElement.classList.remove("rsvp-open");
      window.dispatchEvent(new Event(SCROLL_UNLOCK));
      setOpen(false);
      // If the browser closed the dialog itself, drop the history entry too.
      if (historyFlagged()) window.history.back();
    };
    d.addEventListener("cancel", onCancel);
    d.addEventListener("close", onClose);
    return () => {
      d.removeEventListener("cancel", onCancel);
      d.removeEventListener("close", onClose);
      if (d.open) {
        document.documentElement.classList.remove("rsvp-open");
        window.dispatchEvent(new Event(SCROLL_UNLOCK));
      }
    };
  }, [closeForm]);

  // On opening and on every new screen: start at the top, and move focus to the
  // heading (not an input, so phones don't pop the keyboard up unasked).
  useEffect(() => {
    if (!open) return;
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
    headings.current[view]?.focus({ preventScroll: true });
  }, [open, view]);

  const clearError = (key: keyof RegistrationInput) => () => {
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  function collect(form: HTMLFormElement) {
    const fd = new FormData(form);
    const params = new URLSearchParams(window.location.search);
    const raw: Record<string, unknown> = Object.fromEntries(fd.entries());
    raw.consent = fd.get("consent") === "on";
    raw.project = project;
    raw.utmSource = params.get("utm_source") || "";
    raw.utmMedium = params.get("utm_medium") || "";
    raw.utmCampaign = params.get("utm_campaign") || "";
    return { data: normalise(raw), company: fd.get("company") || "" };
  }

  function showErrors(found: FieldErrors) {
    setErrors(found);
    const first = SCREEN_ORDER.flatMap((s) => SCREENS[s] as readonly (keyof RegistrationInput)[]).find((k) => found[k]);
    if (!first) return;
    const where = SCREEN_ORDER.find((s) => (SCREENS[s] as readonly string[]).includes(first));
    if (where && where !== screen) setScreen(where);
    window.setTimeout(() => focusField(first), 0);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    setAlert("");
    const { data, company } = collect(e.currentTarget);

    if (screen !== "ready") {
      const found = validate(data, SCREENS[screen]);
      if (Object.keys(found).length) {
        showErrors(found);
        return;
      }
      setErrors({});
      setScreen(SCREEN_ORDER[SCREEN_ORDER.indexOf(screen) + 1]);
      return;
    }

    const found = validate(data);
    if (Object.keys(found).length) {
      showErrors(found);
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, company }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.ok) {
        if (out.errors && Object.keys(out.errors).length) showErrors(out.errors);
        else setAlert(out.error || "We couldn’t save your registration. Try again in a moment.");
        return;
      }
      const record: Saved = { id: out.id, firstName: data.fullName.split(" ")[0], joined: false };
      writeSaved(record);
      setSaved(record);
      setStep("community");
    } catch {
      setAlert("You appear to be offline. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  function back() {
    setAlert("");
    setErrors({});
    setScreen(SCREEN_ORDER[Math.max(0, SCREEN_ORDER.indexOf(screen) - 1)]);
  }

  function onJoin() {
    if (!saved) return;
    // Record the join in the sheet without delaying the WhatsApp tab.
    fetch("/api/community", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: saved.id }),
      keepalive: true,
    }).catch(() => {});
    const record = { ...saved, joined: true };
    writeSaved(record);
    setSaved(record);
    // Let the new tab open before the view changes.
    window.setTimeout(() => setStep("done"), 400);
  }

  function reset() {
    writeSaved(null);
    setSaved(null);
    setErrors({});
    setAlert("");
    setBudget("");
    setHeard("");
    setScreen("details");
    setStep("form");
  }

  const stage = SCREEN_ORDER.indexOf(screen);
  // One stable callback per heading, so React only calls it when the heading
  // mounts or unmounts, never on a re-render (which would steal focus from a field).
  const headingCallbacks = useRef<Record<string, (el: HTMLElement | null) => void>>({});
  const headingRef = (key: string) =>
    (headingCallbacks.current[key] ??= (el: HTMLElement | null) => {
      headings.current[key] = el;
      // The community and pass views appear after the previous view has faded
      // out, so focus them as they arrive.
      if (el && (key === "community" || key === "done") && dialogRef.current?.open) {
        el.focus({ preventScroll: true });
      }
    });

  return (
    <section className="register" id="register" aria-labelledby="register-heading">
      <div className="container register__grid">
        <aside className="register__aside">
          <p className="eyebrow">Free entry, registered guests only</p>
          <RevealText id="register-heading" className="heading" lines={["Reserve", "your seat"]} />
          <p className="register__lead serif-line">
            Your details and three quick questions. Event updates and directions are shared in the roadshow WhatsApp
            community.
          </p>
          <dl className="details">
            <div className="details__row">
              <dt>City</dt>
              <dd>{EVENT.city}</dd>
            </div>
            {EVENT.days.slice(0, 2).map((d) => (
              <div className="details__row" key={d.value}>
                <dt>{d.value.split(" ")[0]}</dt>
                <dd>
                  {d.value.replace(/^\w+ /, "")}, {d.hours}
                </dd>
              </div>
            ))}
            <div className="details__row">
              <dt>Venue</dt>
              <dd>{EVENT.venue}</dd>
            </div>
          </dl>
          <p className="register__reply">
            Questions first?{" "}
            <a
              className="text-link"
              href={whatsappLink("Hello, I have a question about the Danube Roadshow in Lagos before I register.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ask on WhatsApp
            </a>
            . We reply within {BROKER.replyWithinHours} hours.
          </p>
        </aside>

        <div className="card register__cta">
          {!saved ? (
            <>
              <h3>Three quick questions, then your seat is reserved</h3>
              <p>It takes under a minute. No payment, no obligation to buy.</p>
              <button type="button" className="btn btn--solid" onClick={() => openForm()}>
                Reserve my seat
              </button>
            </>
          ) : !saved.joined ? (
            <>
              <h3>One last step, {saved.firstName}</h3>
              <p>Your details are saved. Join the WhatsApp community to confirm your seat.</p>
              <button type="button" className="btn btn--whatsapp" onClick={() => openForm()}>
                <WhatsAppIcon />
                Join the community
              </button>
            </>
          ) : (
            <>
              <h3>You’re registered, {saved.firstName}</h3>
              <p>Your pass is saved on this device. Show it at the registration desk.</p>
              <div className="register__cta-actions">
                <button type="button" className="btn btn--solid" onClick={() => openForm()}>
                  Show my pass
                </button>
                <button
                  type="button"
                  className="text-link text-button"
                  onClick={() => {
                    reset();
                    openForm();
                  }}
                >
                  Register another guest
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="rsvp"
        aria-labelledby={`rsvp-h-${view}`}
        data-lenis-prevent
        onPointerDown={(e) => {
          pressedOnBackdrop.current = e.target === e.currentTarget;
        }}
        onClick={(e) => {
          // Only a press that starts and ends outside the panel closes it, so
          // selecting text in a field and releasing outside never does.
          if (e.target === e.currentTarget && pressedOnBackdrop.current) closeForm();
          pressedOnBackdrop.current = false;
        }}
      >
        <div className="rsvp__panel">
          <div className="rsvp__top">
            {step === "form" ? (
              <div className="rsvp__progress">
                <span className="rsvp__count">{SCREEN_LABEL[screen]}</span>
                <ol className="rsvp__bar" aria-hidden="true">
                  {SCREEN_ORDER.map((s, i) => (
                    <li key={s} data-state={i < stage ? "done" : i === stage ? "current" : "next"} />
                  ))}
                </ol>
              </div>
            ) : (
              <span className="rsvp__count">{step === "community" ? "Last step" : "Your pass"}</span>
            )}
            <button type="button" className="rsvp__close" onClick={closeForm} aria-label="Close">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div className="rsvp__body" ref={bodyRef}>
            <AnimatePresence mode="wait" initial={false}>
              {step === "form" && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <form ref={formRef} className="form" noValidate onSubmit={onSubmit}>
                    <div className="form__screen" hidden={screen !== "details"}>
                      <div className="field--full rsvp__intro">
                        <h2 id="rsvp-h-details" ref={headingRef("details")} tabIndex={-1} className="rsvp__q">
                          Reserve your seat
                        </h2>
                        <p className="rsvp__hint">Free entry. About {EVENT.dailyCapacity} seats a day, registered guests first.</p>
                      </div>
                      <Field name="fullName" label="Full name" error={errors.fullName} full>
                        <input
                          id="f-fullName"
                          name="fullName"
                          className="field__control"
                          autoComplete="name"
                          placeholder="As on your ID"
                          required
                          aria-invalid={!!errors.fullName}
                          aria-describedby={errors.fullName ? "f-fullName-error" : undefined}
                          onChange={clearError("fullName")}
                        />
                      </Field>
                      <Field name="phone" label="WhatsApp number" error={errors.phone}>
                        <input
                          id="f-phone"
                          name="phone"
                          type="tel"
                          inputMode="tel"
                          className="field__control"
                          autoComplete="tel"
                          placeholder="+234 803 123 4567"
                          required
                          aria-invalid={!!errors.phone}
                          aria-describedby={errors.phone ? "f-phone-error" : undefined}
                          onChange={clearError("phone")}
                        />
                      </Field>
                      <Field name="email" label="Email" error={errors.email}>
                        <input
                          id="f-email"
                          name="email"
                          type="email"
                          inputMode="email"
                          className="field__control"
                          autoComplete="email"
                          placeholder="name@example.com"
                          required
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? "f-email-error" : undefined}
                          onChange={clearError("email")}
                        />
                      </Field>
                      <Choices
                        name="location"
                        label="Where do you live?"
                        options={LOCATIONS}
                        error={errors.location}
                        compact
                        onPick={() => clearError("location")()}
                      />
                      <Choices
                        name="heardFrom"
                        label="How did you hear about the roadshow?"
                        options={HEARD_FROM}
                        error={errors.heardFrom}
                        compact
                        onPick={(v) => {
                          setHeard(v);
                          clearError("heardFrom")();
                          clearError("heardDetail")();
                        }}
                      />
                      {(heard === HEARD_FRIEND || heard === HEARD_OTHER) && (
                        <Field
                          name="heardDetail"
                          label={heard === HEARD_FRIEND ? "Your friend’s name" : "Where did you hear about it?"}
                          error={errors.heardDetail}
                          full
                        >
                          <input
                            key={heard}
                            id="f-heardDetail"
                            name="heardDetail"
                            className="field__control"
                            autoComplete="off"
                            placeholder={heard === HEARD_FRIEND ? "Their full name" : "e.g. a radio advert, a church event"}
                            maxLength={80}
                            aria-invalid={!!errors.heardDetail}
                            aria-describedby={errors.heardDetail ? "f-heardDetail-error" : undefined}
                            onChange={clearError("heardDetail")}
                          />
                        </Field>
                      )}
                    </div>

                    <div className="form__screen" hidden={screen !== "budget"}>
                      <h2 id="rsvp-h-budget" ref={headingRef("budget")} tabIndex={-1} className="rsvp__q field--full">
                        How much are you ready to invest?
                      </h2>
                      <Choices
                        name="budget"
                        options={BUDGETS}
                        labelledBy="rsvp-h-budget"
                        error={errors.budget}
                        onPick={(v) => {
                          setBudget(v);
                          clearError("budget")();
                          if (v !== BUDGET_OTHER) clearError("budgetOther")();
                        }}
                      />
                      {budget === BUDGET_OTHER && (
                        <Field name="budgetOther" label="Your amount in US dollars" error={errors.budgetOther} full>
                          <input
                            id="f-budgetOther"
                            name="budgetOther"
                            className="field__control"
                            inputMode="text"
                            autoComplete="off"
                            placeholder="e.g. $750k"
                            maxLength={60}
                            aria-invalid={!!errors.budgetOther}
                            aria-describedby={errors.budgetOther ? "f-budgetOther-error" : undefined}
                            onChange={clearError("budgetOther")}
                          />
                        </Field>
                      )}
                    </div>

                    <div className="form__screen" hidden={screen !== "buying"}>
                      <h2 id="rsvp-h-buying" ref={headingRef("buying")} tabIndex={-1} className="rsvp__q field--full">
                        How would you like to buy?
                      </h2>
                      <Choices
                        name="buying"
                        options={BUYING}
                        labelledBy="rsvp-h-buying"
                        error={errors.buying}
                        onPick={() => clearError("buying")()}
                      />
                    </div>

                    <div className="form__screen" hidden={screen !== "ready"}>
                      <h2 id="rsvp-h-ready" ref={headingRef("ready")} tabIndex={-1} className="rsvp__q field--full">
                        If we find a home that matches your budget and goals, would you reserve it?
                      </h2>
                      <Choices
                        name="ready"
                        options={READY}
                        labelledBy="rsvp-h-ready"
                        error={errors.ready}
                        onPick={() => clearError("ready")()}
                      />
                      <div className="field field--full" data-invalid={errors.consent ? "true" : undefined}>
                        <label className="check">
                          <input
                            id="f-consent"
                            type="checkbox"
                            name="consent"
                            aria-invalid={!!errors.consent}
                            aria-describedby={errors.consent ? "f-consent-error" : undefined}
                            onChange={clearError("consent")}
                          />
                          <span>
                            I agree to be contacted by {dataHolders()} about the roadshow and its projects, and
                            accept the{" "}
                            <a href="https://danubeproperties.com/terms-conditions/" target="_blank" rel="noopener noreferrer">
                              terms and conditions
                            </a>
                            .
                          </span>
                        </label>
                        {errors.consent && (
                          <span className="field__error" id="f-consent-error" role="alert">
                            {errors.consent}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="honeypot" aria-hidden="true">
                      <label htmlFor="f-company">Company</label>
                      <input id="f-company" name="company" tabIndex={-1} autoComplete="off" />
                    </div>

                    {message && (
                      <p className="form__alert" role="alert">
                        {message}
                      </p>
                    )}

                    <div className="form__submit">
                      <div className="form__buttons">
                        {screen !== "details" && (
                          <button type="button" className="btn form__back" onClick={back}>
                            Back
                          </button>
                        )}
                        <button className="btn btn--solid" type="submit" disabled={sending}>
                          {sending ? (
                            <>
                              <span className="spinner" aria-hidden="true" />
                              Reserving
                            </>
                          ) : screen === "ready" ? (
                            "Confirm my seat"
                          ) : (
                            "Continue"
                          )}
                        </button>
                      </div>
                      {screen === "ready" && (
                        <div className="form__note">
                          <p>No payment, no obligation to buy.</p>
                          <p>Your details go only to {dataHolders()}, never to third parties.</p>
                        </div>
                      )}
                    </div>
                  </form>
                </motion.div>
              )}

              {step === "community" && saved && (
                <motion.div
                  key="community"
                  className="gate"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <h3 id="rsvp-h-community" ref={headingRef("community")} tabIndex={-1}>
                    One last step, {saved.firstName}: join the community
                  </h3>
                  <p>
                    Your details are saved. Your seat is confirmed once you join the Danube Roadshow WhatsApp
                    community, where all event information is shared.
                  </p>
                  <ul className="gate__list">
                    <li>Venue, date and directions</li>
                    <li>Reminders before the doors open</li>
                    <li>New launch and payment plan announcements</li>
                  </ul>
                  <div className="gate__actions">
                    <a
                      className="btn btn--whatsapp"
                      href={COMMUNITY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onJoin}
                    >
                      <WhatsAppIcon />
                      Join the WhatsApp community
                    </a>
                  </div>
                </motion.div>
              )}

              {step === "done" && saved && (
                <motion.div
                  key="done"
                  className="pass"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <h3 id="rsvp-h-done" ref={headingRef("done")} tabIndex={-1}>
                    You’re registered, {saved.firstName}
                  </h3>
                  <p>Show this pass at the registration desk. A screenshot is fine.</p>
                  <div className="pass__ticket">
                    <div className="pass__ticket-head">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/media/logo.png" alt="Danube Properties" width={373} height={20} />
                      <span className="pass__id">{saved.id}</span>
                    </div>
                    <dl className="details">
                      <div className="details__row">
                        <dt>Event</dt>
                        <dd>{EVENT.title}</dd>
                      </div>
                      <div className="details__row">
                        <dt>Dates</dt>
                        <dd>{EVENT.dateLabel}</dd>
                      </div>
                      <div className="details__row">
                        <dt>Doors</dt>
                        <dd>{EVENT.timeLabel}</dd>
                      </div>
                      <div className="details__row">
                        <dt>Venue</dt>
                        <dd>
                          {EVENT.venue}, {EVENT.city}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div className="pass__actions">
                    <a className="btn" href={COMMUNITY_URL} target="_blank" rel="noopener noreferrer">
                      Open the community
                    </a>
                    <a
                      className="text-link"
                      href={whatsappLink(`Hello Danube team, I’ve registered for the Roadshow (ID ${saved.id}) and have a question.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Message the sales team
                    </a>
                    <button type="button" className="text-link text-button" onClick={reset}>
                      Register another guest
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </dialog>
    </section>
  );
}
