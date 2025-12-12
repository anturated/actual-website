import { Perm } from "@/lib/perms";

export interface UserDTO {
  id: string,
  username: string,
  perms: Perm[]
}
