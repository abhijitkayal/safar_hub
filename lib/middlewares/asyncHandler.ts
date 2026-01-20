// lib/middlewares/asyncHandler.ts
export const asyncHandler =
  (fn: Function) => async (req: Request, ...args: any[]) => {
    try {
      return await fn(req, ...args);
    } catch (error: any) {
      return new Response(
        JSON.stringify({
          success: false,
          message: error.message || "Internal Server Error",
        }),
        { status: 500 }
      );
    }
  };