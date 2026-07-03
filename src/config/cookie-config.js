export const cookieOptions = {
    uuid : {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 5 * 60 * 1000,
        path : '/api/v1/auth/verify-email'
    }
}