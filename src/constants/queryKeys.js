export const queryKeys = {
  repairs: {
    all: ["repairs"],
    list: () => [...queryKeys.repairs.all, "list"],
    detail: (id) => [...queryKeys.repairs.all, "detail", id],
    available: () => [...queryKeys.repairs.all, "available"],
  },
  messages: {
    all: ["messages"],
    list: () => [...queryKeys.messages.all, "list"],
    conversation: (repairId) => [
      ...queryKeys.messages.all,
      "conversation",
      repairId,
    ],
  },
  auth: {
    user: ["auth", "user"],
    profile: ["auth", "profile"],
  },
};
