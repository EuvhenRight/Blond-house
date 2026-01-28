import { Resend } from 'resend'
import type { Appointment } from '../types'

const resend = new Resend(process.env.RESEND_API_KEY)

// Use verified domain + display name (helps deliverability and trust)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@blondhouse.nl'
const FROM_NAME = 'Hair Studio'
const FROM = `${FROM_NAME} <${FROM_EMAIL}>`

const STUDIO_ADDRESS = 'Warmoesstraat 155, floor 3, Amsterdam'
const STUDIO_SITE = 'https://blondhouse.nl'

// Shared email layout: professional, minimal spam triggers, physical address in footer
function emailLayout(content: string, title: string) {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title>${title}</title>
	<style>
		body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; background: #f3f4f6; }
		.wrapper { max-width: 600px; margin: 0 auto; padding: 24px; }
		.card { background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
		.header { background: linear-gradient(135deg, #d97706 0%, #b45309 100%); padding: 24px; text-align: center; color: #fff; }
		.header h1 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.02em; }
		.body { padding: 28px 24px; }
		.body h2 { margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #111827; }
		.body p { margin: 0 0 12px; font-size: 15px; }
		.details { background: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #e5e7eb; }
		.detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
		.detail-row:last-child { border-bottom: none; }
		.detail-row strong { color: #374151; }
		.footer { padding: 20px 24px; text-align: center; font-size: 13px; color: #6b7280; background: #f9fafb; border-top: 1px solid #e5e7eb; }
		.footer a { color: #b45309; text-decoration: none; }
		.footer p { margin: 4px 0; }
	</style>
</head>
<body>
	<div class="wrapper">
		<div class="card">
			<div class="header">
				<h1>BlondHouse</h1>
				<p style="margin:8px 0 0; font-size:14px; opacity:0.95;">Hair Studio Amsterdam</p>
			</div>
			<div class="body">
				${content}
			</div>
			<div class="footer">
				<p><strong>BlondHouse</strong> · ${STUDIO_ADDRESS}</p>
				<p><a href="${STUDIO_SITE}">blondhouse.nl</a> · <a href="mailto:${FROM_EMAIL}">${FROM_EMAIL}</a></p>
			</div>
		</div>
	</div>
</body>
</html>`
}

export async function sendBookingConfirmationEmail(appointment: Appointment) {
	if (!appointment.customerEmail) {
		throw new Error('Customer email is required for booking confirmation email')
	}

	const dateFormatted = new Date(appointment.date).toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
	const content = `
		<h2>Appointment confirmed</h2>
		<p>Dear ${appointment.customerName},</p>
		<p>Your appointment has been confirmed.</p>
		<div class="details">
			<div class="detail-row"><strong>Date</strong><span>${dateFormatted}</span></div>
			<div class="detail-row"><strong>Time</strong><span>${appointment.time}</span></div>
			<div class="detail-row"><strong>Name</strong><span>${appointment.customerName}</span></div>
			<div class="detail-row"><strong>Phone</strong><span>${appointment.customerPhone ?? '—'}</span></div>
		</div>
		<p>We look forward to seeing you. If you need to cancel or reschedule, please contact us as soon as possible.</p>
	`
	try {
		const { data, error } = await resend.emails.send({
			from: FROM,
			to: appointment.customerEmail,
			subject: 'Appointment confirmed – BlondHouse',
			html: emailLayout(content, 'Appointment confirmed'),
		})

		if (error) {
			console.error('Error sending confirmation email:', error)
			throw error
		}

		return data
	} catch (error) {
		console.error('Error in sendBookingConfirmationEmail:', error)
		throw error
	}
}

export async function sendAdminNotificationEmail(appointment: Appointment) {
	try {
		const adminEmail =
			process.env.ADMIN_EMAIL_NOTIFICATION || 'yuri.prodjhair@gmail.com'

		const dateFormatted = new Date(appointment.date).toLocaleDateString(
			'en-US',
			{
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			},
		)
		const content = `
			<h2>New appointment booking</h2>
			<p>A new appointment has been booked:</p>
			<div class="details">
				<div class="detail-row"><strong>Customer</strong><span>${appointment.customerName}</span></div>
				<div class="detail-row"><strong>Email</strong><span>${appointment.customerEmail ?? 'Not provided (blocked slot)'}</span></div>
				${appointment.customerPhone ? `<div class="detail-row"><strong>Phone</strong><span>${appointment.customerPhone}</span></div>` : ''}
				<div class="detail-row"><strong>Date</strong><span>${dateFormatted}</span></div>
				<div class="detail-row"><strong>Time</strong><span>${appointment.time}</span></div>
				<div class="detail-row"><strong>Booking ID</strong><span>${appointment.id}</span></div>
			</div>
		`
		const { data, error } = await resend.emails.send({
			from: FROM,
			to: adminEmail,
			subject: `New booking – ${appointment.customerName} – BlondHouse`,
			html: emailLayout(content, 'New appointment booking'),
		})

		if (error) {
			console.error('Error sending admin notification email:', error)
			throw error
		}

		return data
	} catch (error) {
		console.error('Error in sendAdminNotificationEmail:', error)
		throw error
	}
}

export async function sendAppointmentChangeEmail(
	appointment: Appointment,
	oldDate: string,
	oldTime: string,
) {
	if (!appointment.customerEmail) {
		throw new Error('Customer email is required for appointment change email')
	}

	const oldDateFormatted = new Date(oldDate).toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
	const newDateFormatted = new Date(appointment.date).toLocaleDateString(
		'en-US',
		{
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		},
	)
	const content = `
		<h2>Appointment time changed</h2>
		<p>Dear ${appointment.customerName},</p>
		<p>Your appointment time has been changed.</p>
		<div class="details">
			<div class="detail-row"><strong>Previous</strong><span>${oldDateFormatted} at ${oldTime}</span></div>
			<div class="detail-row"><strong>New date & time</strong><span><strong>${newDateFormatted} at ${appointment.time}</strong></span></div>
			<div class="detail-row"><strong>Name</strong><span>${appointment.customerName}</span></div>
			<div class="detail-row"><strong>Phone</strong><span>${appointment.customerPhone ?? '—'}</span></div>
		</div>
		<p>If you have any questions or need to reschedule, please contact us. We look forward to seeing you at the new time.</p>
	`
	try {
		const { data, error } = await resend.emails.send({
			from: FROM,
			to: appointment.customerEmail,
			subject: 'Appointment time changed – BlondHouse',
			html: emailLayout(content, 'Appointment time changed'),
		})

		if (error) {
			console.error('Error sending appointment change email:', error)
			throw error
		}

		return data
	} catch (error) {
		console.error('Error in sendAppointmentChangeEmail:', error)
		throw error
	}
}

export async function sendCancellationEmail(
	appointment: Appointment,
	isCustomer: boolean = true,
) {
	if (isCustomer && !appointment.customerEmail) {
		throw new Error('Customer email is required for cancellation email')
	}

	try {
		const recipient = isCustomer
			? appointment.customerEmail!
			: process.env.ADMIN_EMAIL_NOTIFICATION || 'admin@blondhouse.com'
		const subject = isCustomer
			? 'Appointment cancelled – BlondHouse'
			: `Appointment cancelled – ${appointment.customerName} – BlondHouse`

		const dateFormatted = new Date(appointment.date).toLocaleDateString(
			'en-US',
			{
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			},
		)
		const content = `
			<h2>Appointment cancelled</h2>
			<p>${isCustomer ? `Dear ${appointment.customerName},` : 'Admin notification:'}</p>
			<p>${isCustomer ? 'Your appointment has been cancelled.' : 'The following appointment has been cancelled:'}</p>
			<div class="details">
				<div class="detail-row"><strong>Date</strong><span>${dateFormatted}</span></div>
				<div class="detail-row"><strong>Time</strong><span>${appointment.time}</span></div>
				${!isCustomer ? `<div class="detail-row"><strong>Customer</strong><span>${appointment.customerName}</span></div>` : ''}
			</div>
			<p>${isCustomer ? 'We hope to see you again soon.' : 'The time slot has been made available again.'}</p>
		`
		const { data, error } = await resend.emails.send({
			from: FROM,
			to: recipient,
			subject,
			html: emailLayout(content, 'Appointment cancelled'),
		})

		if (error) {
			console.error('Error sending cancellation email:', error)
			throw error
		}

		return data
	} catch (error) {
		console.error('Error in sendCancellationEmail:', error)
		throw error
	}
}
