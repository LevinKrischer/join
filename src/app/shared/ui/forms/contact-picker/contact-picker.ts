import { Component, Input, Output, EventEmitter, signal, computed, ElementRef, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Contact } from '../../../../core/db/contacts.db';

@Component({
  selector: 'app-contact-picker',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact-picker.html',
  styleUrl: './contact-picker.scss',
})
export class ContactPicker {
  @Input() contacts: Contact[] = [];
  @Output() selectedIdsChange = new EventEmitter<number[]>();
  isOpen = signal(false);
  selectedIds = signal<number[]>([]);

  /** Contacts sorted alphabetically by name. */
  sortedContacts = computed(() => {
    return [...this.contacts].sort((a, b) => a.name.localeCompare(b.name));
  });

  /** The full contact objects for all currently selected IDs. */
  selectedContacts = computed(() => {
    const ids = this.selectedIds();
    return this.contacts.filter(c => ids.includes(c.id));
  });

  constructor(private elRef: ElementRef) {}

  /**
   * Closes the dropdown when a click occurs outside the component.
   * @param event - The document click event.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  /** Opens the dropdown. */
  open() {
    this.isOpen.set(true);
  }

  /**
   * Toggles a contact's selection state.
   * Adds the contact if not selected, removes it if already selected.
   * @param contactId - The ID of the contact to toggle.
   */
  toggleContact(contactId: number) {
    const current = this.selectedIds();
    const updated = current.includes(contactId)
      ? current.filter(id => id !== contactId)
      : [...current, contactId];
    this.selectedIds.set(updated);
    this.selectedIdsChange.emit(updated);
  }

  /**
   * Checks whether a contact is currently selected.
   * @param contactId - The ID of the contact to check.
   * @returns True if the contact is selected.
   */
  isSelected(contactId: number): boolean {
    return this.selectedIds().includes(contactId);
  }

  /**
   * Computes initials from a contact name.
   * Takes the first letter of the first and last name parts.
   * @param name - The full name of the contact.
   * @returns The uppercase initials (e.g. "JD" for "John Doe").
   */
  getInitials(name: string): string {
    const parts = name.split(' ');
    return ((parts[0]?.[0] ?? '') + (parts.at(-1)?.[0] ?? '')).toUpperCase();
  }
}
