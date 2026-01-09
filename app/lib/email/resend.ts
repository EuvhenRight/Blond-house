import { Resend } from 'resend'
import type { Appointment } from '../types'

const resend = new Resend(process.env.RESEND_API_KEY)

// Use verified domain email address
const FROM_EMAIL =
	process.env.RESEND_FROM_EMAIL || 'noreply@blondhouse.nl'

export async function sendBookingConfirmationEmail(appointment: Appointment) {
	if (!appointment.customerEmail) {
		throw new Error('Customer email is required for booking confirmation email')
	}

	try {
		const { data, error } = await resend.emails.send({
			from: FROM_EMAIL,
			to: appointment.customerEmail,
			subject: 'Appointment Confirmation - Blond House',
			html: `
				<!DOCTYPE html>
				<html>
				<head>
					<meta charset="utf-8">
					<style>
						body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
						.container { max-width: 600px; margin: 0 auto; padding: 20px; }
						.header { background: linear-gradient(to right, #fbbf24, #f59e0b); padding: 20px; text-align: center; color: white; }
						.content { background: #f9fafb; padding: 30px; }
						.details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
						.detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
						.detail-row:last-child { border-bottom: none; }
						.footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
					</style>
				</head>
				<body>
					<div class="container">
						<div class="header">
							<h1>BLOND HOUSE</h1>
						</div>
						<div class="content">
							<h2>Appointment Confirmed!</h2>
							<p>Dear ${appointment.customerName},</p>
							<p>Your appointment has been successfully confirmed.</p>
							<div class="details">
								<div class="detail-row">
									<strong>Date:</strong>
									<span>${new Date(appointment.date).toLocaleDateString('en-US', {
										weekday: 'long',
										year: 'numeric',
										month: 'long',
										day: 'numeric',
									})}</span>
								</div>
								<div class="detail-row">
									<strong>Time:</strong>
									<span>${appointment.time}</span>
								</div>
								<div class="detail-row">
									<strong>Name:</strong>
									<span>${appointment.customerName}</span>
								</div>
								<div class="detail-row">
									<strong>Phone:</strong>
									<span>${appointment.customerPhone}</span>
								</div>
							</div>
							<p>We look forward to seeing you!</p>
							<p>If you need to cancel or reschedule, please contact us as soon as possible.</p>
						</div>
						<div class="footer">
							<p>Blond House - Hair Design Studio</p>
							<p>Amsterdam</p>
						</div>
					</div>
				</body>
				</html>
			`,
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

		const { data, error } = await resend.emails.send({
			from: FROM_EMAIL,
			to: adminEmail,
			subject: `New Appointment Booking - ${appointment.customerName}`,
			html: `
				<!DOCTYPE html>
				<html>
				<head>
					<meta charset="utf-8">
					<style>
						body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
						.container { max-width: 600px; margin: 0 auto; padding: 20px; }
						.header { background: linear-gradient(to right, #fbbf24, #f59e0b); padding: 20px; text-align: center; color: white; }
						.content { background: #f9fafb; padding: 30px; }
						.details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
						.detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
						.detail-row:last-child { border-bottom: none; }
						.button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
					</style>
				</head>
				<body>
					<div class="container">
						<div class="header">
							<h1>BLOND HOUSE</h1>
							<h2>New Appointment Booking</h2>
						</div>
						<div class="content">
							<p>A new appointment has been booked:</p>
							<div class="details">
								<div class="detail-row">
									<strong>Customer Name:</strong>
									<span>${appointment.customerName}</span>
								</div>
								${appointment.customerEmail ? `<div class="detail-row">
									<strong>Email:</strong>
									<span>${appointment.customerEmail}</span>
								</div>` : '<div class="detail-row"><strong>Email:</strong><span style="color: #ef4444; font-style: italic;">Not provided (blocked time slot)</span></div>'}
								${appointment.customerPhone ? `<div class="detail-row">
									<strong>Phone:</strong>
									<span>${appointment.customerPhone}</span>
								</div>` : ''}
								<div class="detail-row">
									<strong>Date:</strong>
									<span>${new Date(appointment.date).toLocaleDateString('en-US', {
										weekday: 'long',
										year: 'numeric',
										month: 'long',
										day: 'numeric',
									})}</span>
								</div>
								<div class="detail-row">
									<strong>Time:</strong>
									<span>${appointment.time}</span>
								</div>
								<div class="detail-row">
									<strong>Booking ID:</strong>
									<span>${appointment.id}</span>
								</div>
							</div>
						</div>
					</div>
				</body>
				</html>
			`,
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
	oldTime: string
) {
	if (!appointment.customerEmail) {
		throw new Error('Customer email is required for appointment change email')
	}

	try {
		const { data, error } = await resend.emails.send({
			from: FROM_EMAIL,
			to: appointment.customerEmail,
			subject: 'Appointment Time Changed - Blond House',
			html: `
				<!DOCTYPE html>
				<html>
				<head>
					<meta charset="utf-8">
					<style>
						body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
						.container { max-width: 600px; margin: 0 auto; padding: 20px; }
						.header { background: linear-gradient(to right, #fbbf24, #f59e0b); padding: 20px; text-align: center; color: white; }
						.content { background: #f9fafb; padding: 30px; }
						.details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
						.detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
						.detail-row:last-child { border-bottom: none; }
						.change-notice { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
					</style>
				</head>
				<body>
					<div class="container">
						<div class="header">
							<h1>BLOND HOUSE</h1>
						</div>
						<div class="content">
							<h2>Appointment Time Changed</h2>
							<p>Dear ${appointment.customerName},</p>
							<div class="change-notice">
								<p><strong>Your appointment time has been changed.</strong></p>
							</div>
							<div class="details">
								<div class="detail-row">
									<strong>Previous Date & Time:</strong>
									<span>${new Date(oldDate).toLocaleDateString('en-US', {
										weekday: 'long',
										year: 'numeric',
										month: 'long',
										day: 'numeric',
									})} at ${oldTime}</span>
								</div>
								<div class="detail-row">
									<strong>New Date & Time:</strong>
									<span><strong>${new Date(appointment.date).toLocaleDateString('en-US', {
										weekday: 'long',
										year: 'numeric',
										month: 'long',
										day: 'numeric',
									})} at ${appointment.time}</strong></span>
								</div>
								<div class="detail-row">
									<strong>Name:</strong>
									<span>${appointment.customerName}</span>
								</div>
								<div class="detail-row">
									<strong>Phone:</strong>
									<span>${appointment.customerPhone}</span>
								</div>
							</div>
							<p>We apologize for any inconvenience. If you have any questions or need to reschedule, please contact us.</p>
							<p>We look forward to seeing you at the new time!</p>
						</div>
						<div class="footer">
							<p>Blond House - Hair Design Studio</p>
							<p>Amsterdam</p>
						</div>
					</div>
				</body>
				</html>
			`,
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
	isCustomer: boolean = true
) {
	if (isCustomer && !appointment.customerEmail) {
		throw new Error('Customer email is required for cancellation email')
	}

	try {
		const recipient = isCustomer
			? appointment.customerEmail!
			: process.env.ADMIN_EMAIL_NOTIFICATION || 'admin@blondhouse.com'
		const subject = isCustomer
			? 'Appointment Cancelled - Blond House'
			: `Appointment Cancelled - ${appointment.customerName}`

		const { data, error } = await resend.emails.send({
			from: FROM_EMAIL,
			to: recipient,
			subject,
			html: `
				<!DOCTYPE html>
				<html>
				<head>
					<meta charset="utf-8">
					<style>
						body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
						.container { max-width: 600px; margin: 0 auto; padding: 20px; }
						.header { background: linear-gradient(to right, #fbbf24, #f59e0b); padding: 20px; text-align: center; color: white; }
						.content { background: #f9fafb; padding: 30px; }
						.details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
						.detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
						.detail-row:last-child { border-bottom: none; }
					</style>
				</head>
				<body>
					<div class="container">
						<div class="header">
							<h1>BLOND HOUSE</h1>
						</div>
						<div class="content">
							<h2>Appointment Cancelled</h2>
							<p>${
								isCustomer
									? `Dear ${appointment.customerName},`
									: 'Admin Notification:'
							}</p>
							<p>${
								isCustomer
									? 'Your appointment has been cancelled.'
									: `The following appointment has been cancelled:`
							}</p>
							<div class="details">
								<div class="detail-row">
									<strong>Date:</strong>
									<span>${new Date(appointment.date).toLocaleDateString('en-US', {
										weekday: 'long',
										year: 'numeric',
										month: 'long',
										day: 'numeric',
									})}</span>
								</div>
								<div class="detail-row">
									<strong>Time:</strong>
									<span>${appointment.time}</span>
								</div>
								${
									!isCustomer
										? `<div class="detail-row"><strong>Customer:</strong><span>${appointment.customerName}</span></div>`
										: ''
								}
							</div>
							${
								isCustomer
									? '<p>We hope to see you again soon!</p>'
									: '<p>The time slot has been made available again.</p>'
							}
						</div>
					</div>
				</body>
				</html>
			`,
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
