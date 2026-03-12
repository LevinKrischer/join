export interface SingleContact {
  id?: string;
  name: string;
  email: string;
  phone: string;
  color?: string;
}


export interface ContactWithInitials extends SingleContact {
  initials: string;
}


export interface GroupedContacts {
  letter: string;
  contacts: ContactWithInitials[];
}
