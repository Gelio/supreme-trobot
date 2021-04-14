export const extensionId: string = import.meta.env.SNOWPACK_PUBLIC_EXTENSION_ID;

if (!extensionId) {
  console.error(
    "SNOWPACK_PUBLIC_EXTENSION_ID environment variable is not defined. The extension will not work. Please configure your .env file"
  );
}
