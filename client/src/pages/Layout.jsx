import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchWorkspaces } from '../features/workspaceSlice'
import { loadTheme } from '../features/themeSlice'
import { Loader2Icon } from 'lucide-react'
import Auth from './Auth'
import CreateWorkspaceDialog from '../components/CreateWorkspaceDialog'

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const { user, isAuthenticated, loading: authLoading } = useSelector((state) => state.auth)
    const { workspaces, loading: workspaceLoading, errorStatus } = useSelector((state) => state.workspace)
    
    const dispatch = useDispatch()
    const navigate = useNavigate()

    // Initial load of theme
    useEffect(() => {
        dispatch(loadTheme())
    }, [dispatch])

    // Initial load of workspaces
    useEffect(() => {
        if (isAuthenticated && user) {
            dispatch(fetchWorkspaces())
        }
    }, [isAuthenticated, user, dispatch])

    useEffect(() => {
        if (errorStatus === 401) {
            navigate('/', { replace: true })
        }
    }, [errorStatus, navigate])

    if (authLoading) {
        return (
            <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
                <Loader2Icon className="size-7 text-indigo-500 animate-spin" />
            </div>
        )
    }

    if (!isAuthenticated || !user) {
        return <Auth />
    }

    if (workspaceLoading && workspaces.length === 0) return (
        <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
            <Loader2Icon className="size-7 text-indigo-500 animate-spin" />
        </div>
    )

    if (isAuthenticated && user && workspaces.length === 0) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-white dark:bg-zinc-950 p-4">
                <CreateWorkspaceDialog />
            </div>
        )
    }

    return (
        <div className="flex bg-white dark:bg-zinc-950 text-gray-900 dark:text-slate-100">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                <div className="flex-1 h-full p-6 xl:p-10 xl:px-16 overflow-y-scroll">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Layout
