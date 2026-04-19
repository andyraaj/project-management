import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../configs/api";

export const login = createAsyncThunk("auth/login", async (userData, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/api/auth/login", userData);
        localStorage.setItem("token", data.token);
        return data.user;
    } catch (error) {
        return rejectWithValue(error?.response?.data?.message || "Login failed");
    }
});

export const register = createAsyncThunk("auth/register", async (userData, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/api/auth/register", userData);
        localStorage.setItem("token", data.token);
        return data.user;
    } catch (error) {
        return rejectWithValue(error?.response?.data?.message || "Registration failed");
    }
});

export const fetchUser = createAsyncThunk("auth/fetchUser", async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get("/api/auth/me");
        return data.user;
    } catch (error) {
        localStorage.removeItem("token");
        return rejectWithValue(error?.response?.data?.message || "Failed to fetch user");
    }
});

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        loading: true, // initial state is loading until fetchUser is done
        isAuthenticated: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            localStorage.removeItem("token");
            state.user = null;
            state.isAuthenticated = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchUser.pending, (state) => { state.loading = true; })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(fetchUser.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
