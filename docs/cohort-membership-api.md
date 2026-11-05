# Cohort members and invitations

The instructor frontend is at `/instructor/cohorts/members`, reached through **Manage Students** under Cohorts in the sidebar or **Manage members** in a cohort's action menu. The `?cohort={id}` query parameter selects a cohort; the page includes a cohort switcher. Existing `/instructor/cohorts/:cohortId/members` links also work. All API calls use the existing cookie authentication.

## List members

`GET /cohorts/{cohort_id}/members`

Return `200` with an array (not an envelope):

```json
[
  {
    "id": 12,
    "user_id": "user-uuid",
    "username": "ada",
    "email": "ada@example.com",
    "role": "student",
    "payment_status": "owing",
    "total_xp": 150
  }
]
```

`id` identifies the membership record. Roles are `student`, `ta`, and `instructor`. Payment statuses are displayed as returned; filter options come from the response. Return numeric XP. The page also reads cohort name, course title, and seat capacity from the existing `GET /instructor/cohorts` endpoint. Only students count toward student-seat usage.

## Change role

`PATCH /cohorts/{cohort_id}/members/{membership_id}/role`

```json
{ "role": "ta" }
```

Only `student` and `ta` are accepted as target roles. Return `204` (no body), or another successful status. The frontend does not consume the response body and refreshes lists after success.

Verify instructor ownership and membership/cohort association. Protect the owner's instructor membership and reject attempts to assign the instructor role. No payment or XP fields are sent, and there are no direct-add or remove-member controls.

## Create invitation

`POST /cohorts/{cohort_id}/invitations`

```json
{ "email": "ada@example.com", "access": "waived" }
```

`access` is `owing` or `waived`. Both invite the recipient as a student. Return `201` with:

```json
{
  "invitation_url": "https://logixia.com/invitations/accept?token=opaque-token",
  "expires_at": "2026-11-06T14:30:00Z"
}
```

Return an absolute invitation URL and a timezone-aware ISO expiry. The frontend displays the URL and a Copy button; it does not send email. The backend generates the secure token and enforces email binding, 24-hour expiry, and single use. Creating an invitation does not create membership or consume a student seat.

When accepting, authenticate the recipient, match their verified email, check seat availability, and create membership and consume the invitation in one transaction. Existing members must not have their role or payment status changed by redeeming an invitation. The student frontend now handles `/invitations/accept?token=...`, using the preview and acceptance endpoints below.

## Errors

Return standard HTTP statuses with `{ "detail": "Human-readable reason" }`. Use `401` for unauthenticated requests, `403` for insufficient access, `404` for unavailable cohorts/memberships, `409` for conflicts such as an existing member, and `422` for invalid input. Backend authorization remains required even when controls are hidden in the frontend.

## Preview an invitation

`GET /invitations/preview?token={url_encoded_token}`

Require authentication. Return `200`:

```json
{
  "cohort_id": 1,
  "cohort_name": "Python Evening Class",
  "course_title": "Python Fundamentals",
  "email": "ada@example.com",
  "access": "waived",
  "expires_at": "2026-11-06T12:00:00Z"
}
```

Preview must not consume the invitation or create membership. Return `Cache-Control: no-store`. The frontend waits for sign-in before requesting this information and returns to the full invitation URL after login/signup. It shows the expiry and payment obligation and requires an explicit acceptance click. The backend must verify the signed-in user's verified email; the frontend email comparison is only a usability check. Avoid logging invitation tokens.

## Accept an invitation

`POST /invitations/accept`

```json
{ "token": "opaque-token" }
```

Return `200` or `201` with:

```json
{ "cohort_id": 1, "membership_id": 12 }
```

Only accept the token from the client; derive cohort, email, role (`student`), and payment access from the stored invitation. Verify ownership of the invited email, expiry, unused/unrevoked state, cohort availability and student capacity. Atomically create the membership and mark the invitation accepted. Do not change existing memberships through this endpoint. The frontend refreshes cohort queries after success and offers a dashboard link.

For both preview and acceptance use `401` when authentication is required, `403` for email mismatch or unverified email, `404` for an invalid token, `410` for expired/revoked invitations, and `409` for already-used invitations or existing membership. Return `400` with an actionable detail for other business-rule failures such as a full cohort. No membership is created by opening the frontend link or making the preview GET request.
