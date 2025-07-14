import { signIn, signUp } from "supertokens-web-js/recipe/emailpassword";
import { getAuthorisationURLWithQueryParamsAndSetState } from "supertokens-web-js/recipe/thirdparty";
import { PostFormAPI } from "./RequestService";

export const signup = async (email: string, password: string) => {
  try {
    const response = await signUp({
      formFields: [
        {
          id: "email",
          value: email,
        },
        {
          id: "password",
          value: password,
        },
      ],
    });

    if (response.status === "FIELD_ERROR") {
      response.formFields.forEach((formField) => {
        if (formField.id === "email") {
          return { success: false, error: formField.error };
        } else if (formField.id === "password") {
          return { success: false, error: formField.error };
        }
      });
    } else if (response.status === "SIGN_UP_NOT_ALLOWED") {
      return { success: false, error: response.reason };
    } else {
      return { success: true };
    }
  } catch (err: any) {
    if (err.isSuperTokensGeneralError === true) {
      return { success: false, error: err.message };
    } else {
      return { success: false, error: "Oops! Something went wrong." };
    }
  }
};

export const login = async (email: string, password: string) => {
  try {
    const response = await signIn({
      formFields: [
        {
          id: "email",
          value: email,
        },
        {
          id: "password",
          value: password,
        },
      ],
    });

    if (response.status === "FIELD_ERROR") {
      response.formFields.forEach((formField) => {
        if (formField.id === "email") {
          return { success: false, error: formField.error };
        }
      });
    } else if (response.status === "WRONG_CREDENTIALS_ERROR") {
      return {
        success: false,
        error: "Email password combination is incorrect.",
      };
    } else if (response.status === "SIGN_IN_NOT_ALLOWED") {
      return { success: false, error: response.reason };
    } else {
      return { success: true };
    }
  } catch (err: any) {
    if (err.isSuperTokensGeneralError === true) {
      return { success: false, error: err.message };
    } else {
      return { success: false, error: "Oops! Something went wrong." };
    }
  }
};

export const googleLogin = async () => {
  try {
    const authUrl = await getAuthorisationURLWithQueryParamsAndSetState({
      thirdPartyId: "google",
      frontendRedirectURI: `${window.location.origin.toString()}/auth/callback/google`,
    });
    return { success: true, data: { authUrl: authUrl } };
  } catch (err: any) {
    if (err.isSuperTokensGeneralError === true) {
      return { success: false, error: err.message };
    } else {
      return { success: false, error: "Oops! Something went wrong." };
    }
  }
};

export const setUsername = async (formData: FormData) => {
  const response = await PostFormAPI("/user/create", formData);
  if (response.success) {
    window.location.replace("/");
  } else {
    console.log(response.error);
  }
};
