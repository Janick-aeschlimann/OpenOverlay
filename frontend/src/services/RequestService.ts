import Session from "supertokens-web-js/recipe/session";

const APIUrl = `${import.meta.env.VITE_API_URL}/api`;

export const GetAPI = async (
  endpoint: string,
  authenticated: boolean = true
) => {
  const accessToken = await Session.getAccessToken();
  const response = await fetch(APIUrl + endpoint, {
    method: "GET",
    headers: authenticated ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  if (!response.ok) {
    try {
      const { message } = await response.json();
      if (message) {
        return { success: false, status: response.status, error: message };
      } else {
        throw new Error();
      }
    } catch {
      return {
        success: false,
        status: response.status,
        error: "Invalid JSON in response",
      };
    }
  }

  try {
    const data = await response.json();
    return { success: true, data: data };
  } catch {
    return { success: false, error: "Invalid JSON in response" };
  }
};

export const PostAPI = async (
  endpoint: string,
  body: any,
  authenticated: boolean = true
) => {
  const accessToken = await Session.getAccessToken();
  const response = await fetch(APIUrl + endpoint, {
    method: "POST",
    body: JSON.stringify(body),
    credentials: "include",
    headers: authenticated
      ? {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        }
      : { "Content-Type": "application/json" },
  });

  console.log(response);

  if (!response.ok) {
    try {
      const { message } = await response.json();
      if (message) {
        return { success: false, status: response.status, error: message };
      } else {
        throw new Error();
      }
    } catch {
      return {
        success: false,
        status: response.status,
        error: "Invalid JSON in response",
      };
    }
  }

  try {
    const data = await response.json();
    return { success: true, data: data };
  } catch {
    return { success: false, error: "Invalid JSON in response" };
  }
};

export const PostFormAPI = async (
  endpoint: string,
  formData: FormData,
  authenticated: boolean = true
) => {
  const accessToken = await Session.getAccessToken();
  const response = await fetch(APIUrl + endpoint, {
    method: "POST",
    body: formData,
    credentials: "include",
    headers: authenticated
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : {},
  });

  console.log(response);

  if (!response.ok) {
    try {
      const { message } = await response.json();
      if (message) {
        return { success: false, status: response.status, error: message };
      } else {
        throw new Error();
      }
    } catch {
      return {
        success: false,
        status: response.status,
        error: "Invalid JSON in response",
      };
    }
  }

  try {
    const data = await response.json();
    return { success: true, data: data };
  } catch {
    return { success: false, error: "Invalid JSON in response" };
  }
};
