import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createWorkspace } from '../features/workspaceSlice';
import { Loader2Icon, Building2Icon } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateWorkspaceDialog = () => {
    const [name, setName] = useState('');
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.workspace);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name.trim()) return;

        const action = await dispatch(createWorkspace({ name }));
        
        if (createWorkspace.rejected.match(action)) {
            toast.error(action.payload?.message || "Failed to create workspace");
        } else {
            toast.success("Workspace created successfully");
        }
    };

    return (
        <div className="w-full max-w-md p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800">
            <div className="flex flex-col items-center mb-8 text-center">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4">
                    <Building2Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Workspace</h2>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">
                    A workspace is where your projects and tasks live.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                        Workspace Name
                    </label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                        placeholder="e.g. Acme Corp"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70"
                >
                    {loading ? (
                        <Loader2Icon className="w-5 h-5 animate-spin" />
                    ) : (
                        "Create Workspace"
                    )}
                </button>
            </form>
        </div>
    );
};

export default CreateWorkspaceDialog;
