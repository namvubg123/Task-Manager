import { apiSlice } from "../apiSlice";

const DEPARTMENT_URL = "/department";

export const departmentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDepartments: builder.query({
      query: (department) => ({
        url: `${DEPARTMENT_URL}/`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Departments"],
    }),
    getDepartmentById: builder.query({
      query: ({ id }) => ({
        url: `${DEPARTMENT_URL}/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Departments"],
    }),
    createDepartment: builder.mutation({
      query: (data) => ({
        url: `${DEPARTMENT_URL}/create`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Departments"],
    }),
    updateDepartment: builder.mutation({
      query: (data) => ({
        url: `${DEPARTMENT_URL}/update`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Departments"],
    }),
    deleteDepartment: builder.mutation({
      query: (id) => ({
        url: `${DEPARTMENT_URL}/delete/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["Departments"],
    }),
  }),
});

export const {
  useGetDepartmentsQuery,
  useGetDepartmentByIdQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentApi;
