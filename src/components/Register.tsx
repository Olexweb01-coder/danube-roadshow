"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { BROKER, COMMUNITY_URL, EVENT, whatsappLink } from "@/config/event";
import {
  BUDGETS,
  EXPERIENCE,
  GOALS,
  GUESTS,
  INTERESTS,
  PAYMENT,
  STEP_ONE,
  TIMELINES,
  UNIT_TYPES,
  normalise,
  validate,
  type FieldErrors,
  type RegistrationInput,
} from "@/lib/registration";
import { WhatsAppIcon } from "./Icons";

type Step = "form" | "community" | "done";
type Screen = "seat" | "goals";
type Saved = { id: string; firstName: string; joined: boolean; day?: string };

const STORAGE_KEY = "danube-roadshow-registration";
const EASE = [0.22, 1, 0.36, 1] as const;

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

function passDay(day?: string) {
  const d = EVENT.days.find((x) => x.value === day);
  if (!d || !d.hours) return `${EVENT.dateLabel}. Either day, ${EVENT.timeLabel}`;
  return `${d.label}, ${d.hours}`;
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

function Select({
  name,
  options,
  placeholder,
  error,
  onChange,
}: {
  name: keyof RegistrationInput;
  options: readonly string[];
  placeholder: string;
  error?: string;
  onChange: () => void;
}) {
  return (
    <select
      id={`f-${name}`}
      name={name}
      className="field__control"
      defaultValue=""
      required
      aria-invalid={!!error}
      aria-describedby={error ? `f-${name}-error` : undefined}
      onChange={onChange}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export default function Register() {
  const [step, setStep] = useState<Step>("form");
  const [saved, setSaved] = useState<Saved | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [alert, setAlert] = useState("");
  const [sending, setSending] = useState(false);
  const [screen, setScreen] = useState<Screen>("seat");
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // Resume an earlier visit: someone who registered but never joined the
  // community lands back on the community step.
  useEffect(() => {
    const s = readSaved();
    if (s) {
      setSaved(s);
      setStep(s.joined ? "done" : "community");
    }
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [step, screen]);

  const clearError = (key: keyof RegistrationInput) => () => {
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  function collect(form: HTMLFormElement) {
    const fd = new FormData(form);
    const params = new URLSearchParams(window.location.search);
    const raw: Record<string, unknown> = Object.fromEntries(fd.entries());
    raw.consent = fd.get("consent") === "on";
    raw.utmSource = params.get("utm_source") || "";
    raw.utmMedium = params.get("utm_medium") || "";
    raw.utmCampaign = params.get("utm_campaign") || "";
    return { data: normalise(raw), company: fd.get("company") || "" };
  }

  function onContinue() {
    if (!formRef.current) return;
    setAlert("");
    const { data } = collect(formRef.current);
    const found = validate(data, STEP_ONE);
    setErrors(found);
    if (Object.keys(found).length) {
      setAlert("Check the highlighted fields.");
      document.getElementById(`f-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setScreen("goals");
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    if (screen === "seat") {
      onContinue();
      return;
    }
    setAlert("");

    const { data, company } = collect(e.currentTarget);
    const found = validate(data);
    setErrors(found);
    if (Object.keys(found).length) {
      setAlert("Check the highlighted fields.");
      const first = Object.keys(found)[0] as keyof RegistrationInput;
      if (STEP_ONE.includes(first)) setScreen("seat");
      window.setTimeout(() => document.getElementById(`f-${first}`)?.focus(), 0);
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
        if (out.errors) setErrors(out.errors);
        setAlert(out.error || "We couldn’t save your registration. Try again in a moment.");
        return;
      }
      const record: Saved = { id: out.id, firstName: data.fullName.split(" ")[0], joined: false, day: data.day };
      writeSaved(record);
      setSaved(record);
      setStep("community");
    } catch {
      setAlert("You appear to be offline. Check your connection and try again.");
    } finally {
      setSending(false);
    }
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
    setScreen("seat");
    setStep("form");
  }

  const current = step === "form" ? screen : step;
  const stepState = (s: Screen | Step) => {
    const order = ["seat", "goals", "community", "done"];
    const i = order.indexOf(s);
    const cur = order.indexOf(current);
    return i < cur ? "done" : i === cur ? "current" : "next";
  };

  return (
    <section className="register" id="register" aria-labelledby="register-heading">
      <div className="container register__grid">
        <aside className="register__aside">
          <p className="eyebrow">Free entry, registered guests only</p>
          <h2 id="register-heading" className="heading">
            Reserve your seat
          </h2>
          <p className="register__lead serif-line">
            Two short screens. Event updates and directions are shared in the roadshow WhatsApp community.
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

        <div className="card">
          <ol className="steps" aria-label="Registration progress">
            <li data-state={stepState("seat")}>Your seat</li>
            <li data-state={stepState("goals")}>Your goals</li>
            <li data-state={stepState("community")}>Community</li>
            <li data-state={stepState("done")}>Your pass</li>
          </ol>

          <AnimatePresence mode="wait" initial={false}>
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <h3 ref={headingRef} tabIndex={-1} className="sr-only">
                  {screen === "seat" ? "Your seat" : "Your goals"}
                </h3>
                <form ref={formRef} className="form" noValidate onSubmit={onSubmit}>
                  <div className="form__screen" hidden={screen !== "seat"}>
                    <Field name="fullName" label="Full name" error={errors.fullName}>
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
                    <Field name="city" label="City and country you live in" error={errors.city}>
                      <input
                        id="f-city"
                        name="city"
                        className="field__control"
                        autoComplete="address-level2"
                        placeholder="e.g. Lagos, Nigeria"
                        required
                        aria-invalid={!!errors.city}
                        aria-describedby={errors.city ? "f-city-error" : undefined}
                        onChange={clearError("city")}
                      />
                    </Field>
                    <Field name="day" label="Which day will you attend?" error={errors.day} full>
                      <Select
                        name="day"
                        options={EVENT.days.map((d) => d.value)}
                        placeholder="Choose a day"
                        error={errors.day}
                        onChange={clearError("day")}
                      />
                    </Field>
                  </div>

                  <div className="form__screen" hidden={screen !== "goals"}>
                    <Field name="interest" label="Project you’re most interested in" error={errors.interest} full>
                      <Select name="interest" options={INTERESTS} placeholder="Choose a project" error={errors.interest} onChange={clearError("interest")} />
                    </Field>
                    <Field name="budget" label="Budget" error={errors.budget} full>
                      <Select name="budget" options={BUDGETS} placeholder="Choose a budget" error={errors.budget} onChange={clearError("budget")} />
                    </Field>
                    <Field name="goal" label="Main goal" error={errors.goal}>
                      <Select name="goal" options={GOALS} placeholder="Choose a goal" error={errors.goal} onChange={clearError("goal")} />
                    </Field>
                    <Field name="unitType" label="Home type" error={errors.unitType}>
                      <Select name="unitType" options={UNIT_TYPES} placeholder="Choose a home type" error={errors.unitType} onChange={clearError("unitType")} />
                    </Field>
                    <Field name="payment" label="How would you prefer to pay?" error={errors.payment}>
                      <Select name="payment" options={PAYMENT} placeholder="Choose one" error={errors.payment} onChange={clearError("payment")} />
                    </Field>
                    <Field name="timeline" label="When are you looking to buy?" error={errors.timeline}>
                      <Select name="timeline" options={TIMELINES} placeholder="Choose a timeline" error={errors.timeline} onChange={clearError("timeline")} />
                    </Field>
                    <Field name="experience" label="Have you bought in Dubai before?" error={errors.experience}>
                      <Select name="experience" options={EXPERIENCE} placeholder="Choose one" error={errors.experience} onChange={clearError("experience")} />
                    </Field>
                    <Field name="guests" label="Who’s attending" error={errors.guests}>
                      <Select name="guests" options={GUESTS} placeholder="Number of people" error={errors.guests} onChange={clearError("guests")} />
                    </Field>

                    <div className="field field--full" data-invalid={errors.consent ? "true" : undefined}>
                      <label className="check">
                        <input id="f-consent" type="checkbox" name="consent" onChange={clearError("consent")} />
                        <span>
                          I agree to be contacted by Danube Properties and {BROKER.name} about the roadshow and its
                          projects, and accept the{" "}
                          <a href="https://danubeproperties.com/terms-conditions/" target="_blank" rel="noopener noreferrer">
                            terms and conditions
                          </a>
                          .
                        </span>
                      </label>
                      {errors.consent && (
                        <span className="field__error" role="alert">
                          {errors.consent}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="honeypot" aria-hidden="true">
                    <label htmlFor="f-company">Company</label>
                    <input id="f-company" name="company" tabIndex={-1} autoComplete="off" />
                  </div>

                  {alert && (
                    <p className="form__alert" role="alert">
                      {alert}
                    </p>
                  )}

                  <div className="form__submit">
                    <p className="micro">
                      {screen === "seat"
                        ? `Free entry. About ${EVENT.dailyCapacity} seats a day, registered guests first.`
                        : "Last screen. This helps your advisor prepare the right homes and numbers for you."}
                    </p>
                    <div className="form__buttons">
                      {screen === "goals" && (
                        <button type="button" className="btn form__back" onClick={() => setScreen("seat")}>
                          Back
                        </button>
                      )}
                      <button className="btn btn--solid" type="submit" disabled={sending}>
                        {sending ? (
                          <>
                            <span className="spinner" aria-hidden="true" />
                            Reserving
                          </>
                        ) : screen === "seat" ? (
                          "Reserve my seat"
                        ) : (
                          "Confirm my seat"
                        )}
                      </button>
                    </div>
                    <div className="form__note">
                      <p>Takes under a minute. No payment, no obligation to buy.</p>
                      <p>
                        Your details go only to Danube Properties and {BROKER.name}, never to third parties.
                      </p>
                      <p>Can’t make it? Choose ‘Either day’ and we’ll send the price list on WhatsApp.</p>
                    </div>
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
                <h3 ref={headingRef} tabIndex={-1}>
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
                <h3 ref={headingRef} tabIndex={-1}>
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
                      <dt>Your day</dt>
                      <dd>{passDay(saved.day)}</dd>
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
    </section>
  );
}
