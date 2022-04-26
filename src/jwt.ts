// Import Jose
import * as jose from "https://deno.land/x/jose@v4.7.0/index.ts";

// Add the JWT secret to the window object
declare global {
    interface Window {
        JWT_SECRET: jose.KeyLike;
    }
}

// Generate the JWT secret
window.JWT_SECRET = (await jose.generateSecret(`HS256`)) as jose.KeyLike;

export const createJWT = (
    payload: { [property: string]: unknown },
    expirationTime = 259200, // Valid for 3 days
) =>
    new jose.SignJWT(payload)
        .setProtectedHeader({ alg: `HS256`, typ: `JWT` })
        .setIssuedAt()
        .setExpirationTime(Math.floor(Date.now() / 1000) + expirationTime)
        .sign(window.JWT_SECRET);

export const verifyJWT = (
    token: string,
): Promise<[boolean, jose.JWTVerifyResult | null]> =>
    new Promise((resolve) => {
        jose.jwtVerify(token, window.JWT_SECRET)
            .then((result) => resolve([true, result]))
            .catch(() => resolve([false, null]));
    });
