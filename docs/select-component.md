# Shared Select

Import `Select` from `@/components/ui/Select`. It is controlled: pass a string `value`, an `onChange(value)` callback, and an array of `{ value, label, description?, disabled? }` options.

```tsx
<Field label="Course" htmlFor="course" error={errors.course}>
  <Select
    {...fieldProps("course", errors.course)}
    value={courseId}
    onChange={setCourseId}
    placeholder="Choose a course"
    searchable
    searchPlaceholder="Search courses…"
    options={courses.map((course) => ({
      value: String(course.id),
      label: course.title,
      description: course.status,
    }))}
  />
</Field>
```

Omit `searchable` for short lists such as roles or payment access. Optional props include `disabled`, `name` (hidden form field), `icon`, `emptyMessage`, and `className` (trigger styling). Supply a visible Field label or `aria-label`. Existing `fieldProps` connect hints and errors to the trigger. Pass `disabled` explicitly while saving. Forms continue to validate required values through their existing validation functions.

The component uses Headless UI Listbox for simple selection, and Popover with Combobox for searchable selection. Both menus are positioned outside clipping containers. Search checks labels and descriptions. Arbitrary typed text is never committed as a value.

Run interaction checks with `npm run test:select`.
