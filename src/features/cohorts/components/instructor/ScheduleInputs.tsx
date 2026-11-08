import { inputClass } from "@/components/ui/formStyles";
import type { ScheduleFields } from "../../types/cohortTask";

export interface ScheduleInputsProps {
  fields: ScheduleFields;
  onChange: (fields: ScheduleFields) => void;
  prefix: string;
  locked?: boolean;
}

export function ScheduleInputs({
  fields,
  onChange,
  prefix,
  locked = false,
}: ScheduleInputsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label
          htmlFor={`${prefix}-start`}
          className="mb-1.5 block text-xs text-muted"
        >
          Opens (your local time)
        </label>
        <input
          id={`${prefix}-start`}
          type="datetime-local"
          value={fields.start}
          onChange={(event) =>
            onChange({ ...fields, start: event.target.value })
          }
          className={inputClass}
        />
      </div>
      <div>
        <label
          htmlFor={`${prefix}-due`}
          className="mb-1.5 block text-xs text-muted"
        >
          Deadline (your local time)
        </label>
        <input
          id={`${prefix}-due`}
          type="datetime-local"
          value={fields.due}
          onChange={(event) => onChange({ ...fields, due: event.target.value })}
          className={inputClass}
        />
      </div>
      <div className="col-span-2">
        <label
          htmlFor={`${prefix}-xp`}
          className="mb-1.5 block text-xs text-muted"
        >
          XP {locked && "· Locked by server"}
        </label>
        <input
          id={`${prefix}-xp`}
          type="number"
          min={0}
          step={1}
          value={fields.xp}
          disabled={locked}
          onChange={(event) => onChange({ ...fields, xp: event.target.value })}
          className={`${inputClass} max-w-32 disabled:opacity-60`}
        />
      </div>
    </div>
  );
}
