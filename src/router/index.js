import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import FilesPage from '@/views/FilesPage.vue'
import Profile from '@/views/Profile.vue'
import ImageEditor from "@/views/ImageEditor.vue"
import FileList from '@/views/FileList.vue'
import CanvasEditor from '@/views/CanvasEditor.vue'
import NotAllowed from "@/views/DontAllow.vue"
import AssignFIle from '@/views/AssignFIle.vue'
import AssignedFiles from '@/views/AssignedFiles.vue'
import Landing from '@/views/Landing.vue'
import CornerViewer from '@/views/CornerViewer.vue'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: Landing,
    meta: { 
      requiresAuth: false,
      title: 'Welcome' 
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { 
      requiresAuth: false,
      title: 'Login' 
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { 
      requiresAuth: false,
      title: 'Register' 
    }
  },
  {
    path: '/files',
    name: 'Files',
    component: FilesPage,
    meta: { 
      requiresAuth: true,
      allowedGroups: ['admins','clients'],
      title: 'Files' 
    }
  },
  {
    path: '/file_list',
    name: 'Files_list',
    component: FileList,
    meta: { 
      requiresAuth: true,
      allowedGroups: ['admins','clients'],
      title: 'File List' 
    }
  },
  {
    path: '/assign',
    name: 'Assign',
    component: AssignFIle,
    meta: { 
      requiresAuth: true,
      allowedGroups: ['admins'],
      title: 'Assign' 
    }
  },
  {
    path: '/assigned',
    name: 'Assigned',
    component: AssignedFiles,
    meta: { 
      requiresAuth: true,
      allowedGroups: ['admins', 'specialist'],
      title: 'Assigned' 
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { 
      requiresAuth: true,
      allowedGroups: [ 'admins'],
      title: 'Profile' 
    }
  },
  // {
  //   path: '/image_editor/:id',
  //   name: 'ImageEditor',
  //   component: ImageEditor,
  //   meta: { 
  //     requiresAuth: true,
  //     allowedGroups: ['user', 'premium', 'admin'],
  //     title: 'Image Editor' 
  //   }
  // },
  {
    path: '/canvas_editor/:id',
    name: 'CanvasEditor',
    // component: CanvasEditor,
    component: CornerViewer,
    meta: { 
      requiresAuth: true,
      allowedGroups: [ 'admins', 'specialist'],
      title: 'Canvas Editor' 
    }
  },
  {
    path: '/not_allowed',
    name: 'DontAllow',
    component: NotAllowed,
    meta: { 
      requiresAuth: true,
      title: 'Not Allowed' 
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to check authentication and permissions
router.beforeEach((to, from, next) => {
  // Identify public pages that don't require authentication
  const publicPages = routes.filter(route => route.meta && !route.meta.requiresAuth)
  const publicPagesMap = publicPages.map(route => route.path)
  
  const authRequired = !publicPagesMap.includes(to.path)
  const loggedIn = localStorage.getItem('user')

  // Redirect to login if authentication is required but user is not logged in
  if (authRequired && !loggedIn) {
    return next('/login')
  }

  // If user is logged in, check group permissions
  if (loggedIn && authRequired) {
    const user = JSON.parse(loggedIn) // Parse the user object from localStorage
    
    // Check if route has allowedGroups and if user belongs to any of them
    if (to.meta && to.meta.allowedGroups) {
      const hasRequiredGroup = to.meta.allowedGroups.some(group => 
        user.groups && user.groups.includes(group)
      )
      
      // If user doesn't have required group and isn't trying to access not_allowed page
      if (!hasRequiredGroup && to.path !== '/not_allowed') {
        return next('/not_allowed')
      }
    }
  }

  next() // Proceed to the route
})

export default router