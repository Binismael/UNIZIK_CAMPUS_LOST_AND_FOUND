import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { DEPARTMENTS_BY_FACULTY, FACULTIES, LEVELS, RESIDENCES } from "@/lib/campus-options";

import { Btn, Notice, SelectInput, TextInput } from "./ui";

export const campusSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  admissionNumber: z.string().trim().min(3, "Admission number is required"),
  faculty: z.string().min(1, "Select your faculty"),
  department: z.string().min(1, "Select your department"),
  level: z.string().min(1, "Select your level"),
  residence: z.string().min(1, "Select your hostel or Off campus"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?234|0)[789][01]\d{8}$/, "Enter a valid phone number, e.g. 08031234567"),
});

const accountSchema = campusSchema.extend({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(12, "Password must be at least 12 characters"),
});

export type CampusValues = z.infer<typeof campusSchema>;
export type AccountValues = z.infer<typeof accountSchema>;

function zodResolver<T extends z.ZodTypeAny>(schema: T) {
  return async (values: unknown) => {
    const result = schema.safeParse(values);
    if (result.success) return { values: result.data, errors: {} };
    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0]);
      if (!errors[key]) errors[key] = { type: "validation", message: issue.message };
    }
    return { values: {}, errors };
  };
}

export function ProfileForm({
  mode,
  email,
  defaults,
  submitLabel,
  submitting,
  onSubmit,
  twoColumn = true,
}: {
  mode: "create" | "complete";
  email?: string;
  defaults?: Partial<AccountValues>;
  submitLabel: string;
  submitting: boolean;
  onSubmit: (values: AccountValues) => void;
  twoColumn?: boolean;
}) {
  const schema = mode === "create" ? accountSchema : campusSchema;
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AccountValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      fullName: "",
      admissionNumber: "",
      faculty: "",
      department: "",
      level: "",
      residence: "",
      phone: "",
      email: email ?? "",
      password: "",
      ...defaults,
    },
  });
  const faculty = watch("faculty");
  const departments = DEPARTMENTS_BY_FACULTY[faculty] ?? [];
  const grid = cn("grid gap-4", twoColumn && "lg:grid-cols-2 lg:gap-x-4 lg:gap-y-3");

  const facultyField = register("faculty");

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {mode === "create" ? (
        <>
          <h2 className="text-xl font-bold text-ink">Account</h2>
          <div className={grid}>
            <TextInput label="Full name" placeholder="Chidi Eze" autoComplete="name" error={errors.fullName?.message} {...register("fullName")} />
            <TextInput label="Student email" type="email" placeholder="you@unizik.edu.ng" autoComplete="email" error={errors.email?.message} {...register("email")} />
            <TextInput label="Password" type="password" placeholder="At least 12 characters" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
          </div>
          <h2 className="mt-2 text-xl font-bold text-ink">Campus details</h2>
        </>
      ) : null}
      <div className={grid}>
        {mode === "complete" ? (
          <>
            <TextInput label="Full name" autoComplete="name" error={errors.fullName?.message} {...register("fullName")} />
            <TextInput label="Student email" value={email ?? ""} readOnly aria-readonly="true" />
          </>
        ) : null}
        <TextInput label="Admission number" placeholder="Your admission number" error={errors.admissionNumber?.message} {...register("admissionNumber")} />
        <SelectInput
          label="Faculty"
          placeholder="Select faculty"
          options={FACULTIES}
          error={errors.faculty?.message}
          {...facultyField}
          onChange={(e) => {
            facultyField.onChange(e);
            setValue("department", "");
          }}
        />
        <SelectInput label="Department" placeholder="Select department" options={departments} disabled={!faculty} error={errors.department?.message} {...register("department")} />
        <SelectInput label="Level" placeholder="Select level" options={LEVELS} error={errors.level?.message} {...register("level")} />
        <SelectInput label="Hostel or residence" placeholder="Select hostel or off campus" options={RESIDENCES} error={errors.residence?.message} {...register("residence")} />
        <TextInput label="Phone number (WhatsApp)" type="tel" inputMode="tel" placeholder="080 0000 0000" autoComplete="tel" error={errors.phone?.message} {...register("phone", { setValueAs: (v: string) => v.replace(/\s+/g, "") })} />
      </div>
      <Notice>Your phone number and hostel are only shared with a claimant after you approve their claim.</Notice>
      <Btn type="submit" disabled={submitting}>
        {submitting ? "Saving…" : submitLabel}
      </Btn>
    </form>
  );
}
