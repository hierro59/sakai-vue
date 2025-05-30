import { authClient } from '@/main';
import { ref } from 'vue';

const isLoading = ref(true);

const getCourses = async () => {
    const response = await authClient.get(`/tenant/course`);
    return response.data.data;
}

const createCourse = async (data) => {
    const response = await authClient.post(`/tenant/course/create`, data);
    //console.log(response.data.data);
    return response.data.data;
}

const updateCourse = async (id, data) => {
    const response = await authClient.put(`/tenant/course/${id}`, data);
    //console.log(response.data.data);
    return response.data.data;
}

const getCourse = async (id) => {
    try {
        const response = await authClient.get(`/tenant/course/${id}`);
        return response.data.data;
    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false; // Finaliza la carga
    }
}

const archiveCourse = async (id) => {
    try {
        const response = await authClient.put(`/tenant/course/archive/${id}`);
        return response.data.data;
    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false; // Finaliza la carga
    }
}

const getCourseByCode = async (code) => {
    try {
        const response = await authClient.get(`/learner/courses/${code}`);
        return response;
    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false; // Finaliza la carga
    }
}

const publishCourse = async (id) => {
    try {
        const response = await authClient.put(`/tenant/course/publish/${id}`);
        return response.data.data;
    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false; // Finaliza la carga
    }
}

const deleteCourse = async (id) => {
    try {
        const response = await authClient.delete(`/tenant/course/delete/${id}`);
        return response.data.data;
    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false; // Finaliza la carga
    }
}

// Learners

const getCoursesByLearner = async (per_page, page, sort, order, filters) => {
    const params = new URLSearchParams({
        per_page,
        page,
        sort,
        order
    });

    filters.forEach(filter => {
        params.append('filters[]', JSON.stringify(filter)); // cada filtro como JSON string
    });

    const response = await authClient.get(`/learner/courses?${params.toString()}`);
    return response.data;
};

const getContents = async (params = {}) => {
    const response = await authClient.get(`/learner/contents`, {
        params
    });
    return response.data;
};

const publishedCourses = async (params = {}) => {

    const response = await authClient.get(`/learner/unregistered-contents`, {
        params
    });
    return response.data;
}

const courseRegistration = async (id) => {
    try {
        const response = await authClient.put(`/learner/courses/register/${id}`);
        return response.data.data;
    } catch (error) {
        console.log(error);
        return error;
    } finally {
        isLoading.value = false; // Finaliza la carga
    }
}

const registerActivity = async (payload) => {
    try {
        const response = await authClient.put(`/learner/courses/register-activity`, payload);
        return response.data.data;
    } catch (error) {
        console.log(error);
        return error;
    } finally {
        isLoading.value = false; // Finaliza la carga
    }
}

const checkActivity = async (course_code) => {
    try {
        const response = await authClient.get(`/learner/courses/check-activity/${course_code}`);
        return response.data;
    } catch (error) {
        console.log(error);
        return error;
    } finally {
        isLoading.value = false; // Finaliza la carga
    }
}

const unsubscribe = async (content_type, subscription_id) => {
    try {
        const response = await authClient.get(`/learner/courses/unsubscribed/content-type/${content_type}/subscription-id/${subscription_id}`);
        return response.data;
    } catch (error) {
        console.log(error);
        return error;
    } finally {
        isLoading.value = false; // Finaliza la carga
    }
}


export default {
    getCourses,
    getContents,
    createCourse,
    getCourse,
    updateCourse,
    publishCourse,
    getCoursesByLearner,
    publishedCourses,
    courseRegistration,
    registerActivity,
    checkActivity,
    getCourseByCode,
    deleteCourse,
    archiveCourse,
    unsubscribe,
    isLoading
};