import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface Room {
  id: string;
  code: string;
  name: string;
  isPublic: boolean;
  createdAt: string;
  users: string[];
}

interface CreateRoomRequest {
  name: string;
  isPublic: boolean;
}

interface JoinRoomRequest {
  userId: string;
}

export const roomsApi = createApi({
  reducerPath: "roomsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    credentials: "include",
  }),
  tagTypes: ["Room"],
  endpoints: (builder) => ({
    getRooms: builder.query<Room[], void>({
      query: () => "rooms",
      providesTags: ["Room"],
    }),
    getRoom: builder.query<Room, string>({
      query: (code) => `rooms/${code}`,
      providesTags: (result, error, code) => [{ type: "Room", id: code }],
    }),
    createRoom: builder.mutation<Room, CreateRoomRequest>({
      query: (body) => ({
        url: "rooms",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Room"],
    }),
    joinRoom: builder.mutation<Room, { code: string; body: JoinRoomRequest }>({
      query: ({ code, body }) => ({
        url: `rooms/${code}/join`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { code }) => [
        { type: "Room", id: code },
      ],
    }),
  }),
});

export const {
  useGetRoomsQuery,
  useGetRoomQuery,
  useCreateRoomMutation,
  useJoinRoomMutation,
} = roomsApi;
