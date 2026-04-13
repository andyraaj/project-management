import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWorkspace } from "../features/workspaceSlice";
import { useNavigate } from "react-router-dom";

function WorkspaceDropdown() {
    const { workspaces } = useSelector((state) => state.workspace);
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
    const [isOpen, setIsOpen] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const dropdownRef = useRef(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onSelectWorkspace = (workspaceId) => {
        dispatch(setCurrentWorkspace(workspaceId));
        setIsOpen(false);
        navigate('/');
    };

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCreateWorkspace = async (e) => {
        e.preventDefault();
        if (!newWorkspaceName.trim()) return;
        setIsCreating(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/workspaces/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name: newWorkspaceName.trim() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            // refresh workspaces by reloading
            window.location.reload();
        } catch (err) {
            alert(err.message || 'Failed to create workspace');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="relative m-4" ref={dropdownRef}>
            <button onClick={() => setIsOpen(prev => !prev)} className="w-full flex items-center justify-between p-3 h-auto text-left rounded hover:bg-gray-100 dark:hover:bg-zinc-800" >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded shadow bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
                        {currentWorkspace?.name?.[0]?.toUpperCase() || "W"}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                            {currentWorkspace?.name || "Select Workspace"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                            {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-zinc-400 flex-shrink-0" />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-64 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded shadow-lg top-full left-0">
                    <div className="p-2">
                        <p className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2 px-2">
                            Workspaces
                        </p>
                        {workspaces.map((workspace) => (
                            <div key={workspace.id} onClick={() => onSelectWorkspace(workspace.id)} className="flex items-center gap-3 p-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800" >
                                <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                    {workspace.name?.[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                        {workspace.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                                        {workspace.members?.length || 0} members
                                    </p>
                                </div>
                                {currentWorkspace?.id === workspace.id && (
                                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                )}
                            </div>
                        ))}
                    </div>

                    <hr className="border-gray-200 dark:border-zinc-700" />

                    {showCreateDialog ? (
                        <form onSubmit={handleCreateWorkspace} className="p-2 space-y-2">
                            <input
                                type="text"
                                value={newWorkspaceName}
                                onChange={(e) => setNewWorkspaceName(e.target.value)}
                                placeholder="Workspace name"
                                className="w-full text-sm px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-blue-500"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button type="submit" disabled={isCreating} className="flex-1 text-xs py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                                    {isCreating ? "Creating..." : "Create"}
                                </button>
                                <button type="button" onClick={() => setShowCreateDialog(false)} className="flex-1 text-xs py-1.5 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div onClick={() => { setShowCreateDialog(true); }} className="p-2 cursor-pointer rounded group hover:bg-gray-100 dark:hover:bg-zinc-800" >
                            <p className="flex items-center text-xs gap-2 my-1 w-full text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300">
                                <Plus className="w-4 h-4" /> Create Workspace
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default WorkspaceDropdown;
