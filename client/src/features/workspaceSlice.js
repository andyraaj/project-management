import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../configs/api";

export const fetchWorkspaces = createAsyncThunk("workspace/fetchWorkspaces", async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get("/api/workspaces");
        return data.workspaces || [];
    } catch (error) {
        return rejectWithValue({
            status: error?.response?.status || null,
            message: error?.response?.data?.message || error.message,
        });
    }
});

export const createWorkspace = createAsyncThunk("workspace/createWorkspace", async (workspaceData, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/api/workspaces/create", workspaceData);
        return data.workspace;
    } catch (error) {
        return rejectWithValue({
            status: error?.response?.status || null,
            message: error?.response?.data?.message || error.message,
        });
    }
});

const initialState = {
    workspaces: [],
    currentWorkspace: null,
    loading: false,
    error: null,
    errorStatus: null,
};

const workspaceSlice = createSlice({
    name: "workspace",
    initialState,
    reducers: {
        setWorkspaces: (state, action) => {
            state.workspaces = action.payload;
        },
        setCurrentWorkspace: (state, action) => {
            localStorage.setItem("currentWorkspaceId", action.payload);
            state.currentWorkspace = state.workspaces.find((w) => w.id === action.payload);
        },
        addWorkspace: (state, action) => {
            state.workspaces.push(action.payload);

            // set current workspace to the new workspace
            if (state.currentWorkspace?.id !== action.payload.id) {
                state.currentWorkspace = action.payload;
            }
        },
        updateWorkspace: (state, action) => {
            state.workspaces = state.workspaces.map((w) =>
                w.id === action.payload.id ? action.payload : w
            );

            // if current workspace is updated, set it to the updated workspace
            if (state.currentWorkspace?.id === action.payload.id) {
                state.currentWorkspace = action.payload;
            }
        },
        deleteWorkspace: (state, action) => {
            state.workspaces = state.workspaces.filter((w) => w._id !== action.payload);
        },
        addProject: (state, action) => {
            state.currentWorkspace.projects.push(action.payload);
            // find workspace by id and add project to it
            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace.id ? { ...w, projects: w.projects.concat(action.payload) } : w
            );
        },
        addTask: (state, action) => {

            state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) => {
                console.log(p.id, action.payload.projectId, p.id === action.payload.projectId);
                if (p.id === action.payload.projectId) {
                    p.tasks.push(action.payload);
                }
                return p;
            });

            // find workspace and project by id and add task to it
            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace.id ? {
                    ...w, projects: w.projects.map((p) =>
                        p.id === action.payload.projectId ? { ...p, tasks: p.tasks.concat(action.payload) } : p
                    )
                } : w
            );
        },
        updateTask: (state, action) => {
            state.currentWorkspace.projects.map((p) => {
                if (p.id === action.payload.projectId) {
                    p.tasks = p.tasks.map((t) =>
                        t.id === action.payload.id ? action.payload : t
                    );
                }
            });
            // find workspace and project by id and update task in it
            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace.id ? {
                    ...w, projects: w.projects.map((p) =>
                        p.id === action.payload.projectId ? {
                            ...p, tasks: p.tasks.map((t) =>
                                t.id === action.payload.id ? action.payload : t
                            )
                        } : p
                    )
                } : w
            );
        },
        deleteTask: (state, action) => {
            state.currentWorkspace.projects.map((p) => {
                p.tasks = p.tasks.filter((t) => !action.payload.includes(t.id));
                return p;
            });
            // find workspace and project by id and delete task from it
            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace.id ? {
                    ...w, projects: w.projects.map((p) =>
                        p.id === action.payload.projectId ? {
                            ...p, tasks: p.tasks.filter((t) => !action.payload.includes(t.id))
                        } : p
                    )
                } : w
            );
        }

    },
    extraReducers: (builder) => {
        builder.addCase(fetchWorkspaces.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.errorStatus = null;
        });
        builder.addCase(fetchWorkspaces.fulfilled, (state, action) => {
            state.workspaces = action.payload;
            if (action.payload.length > 0) {
                const localStorageCurrentWorkspaceId = localStorage.getItem("currentWorkspaceId");
                if (localStorageCurrentWorkspaceId) {
                    const findWorkspace = action.payload.find((w) => w.id === localStorageCurrentWorkspaceId);
                    if (findWorkspace) {
                        state.currentWorkspace = findWorkspace;
                    } else {
                        state.currentWorkspace = action.payload[0];
                    }
                } else {
                    state.currentWorkspace = action.payload[0];
                }
            }
            state.loading = false;
            state.error = null;
            state.errorStatus = null;
        });
        builder.addCase(fetchWorkspaces.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || "Failed to load workspaces";
            state.errorStatus = action.payload?.status || null;
        });
        builder.addCase(createWorkspace.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(createWorkspace.fulfilled, (state, action) => {
            state.loading = false;
            state.workspaces.push(action.payload);
            state.currentWorkspace = action.payload;
            localStorage.setItem("currentWorkspaceId", action.payload.id);
        });
        builder.addCase(createWorkspace.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || "Failed to create workspace";
        });
    }
});

export const { setWorkspaces, setCurrentWorkspace, addWorkspace, updateWorkspace, deleteWorkspace, addProject, addTask, updateTask, deleteTask } = workspaceSlice.actions;
export default workspaceSlice.reducer;