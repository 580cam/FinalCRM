import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuoteForm from '@/components/quote/QuoteForm';

async function goToStep6() {
  const user = userEvent.setup();
  render(<QuoteForm onBack={() => {}} />);

  // Step 1
  const svcGroup = screen.getByRole('group', { name: /service type options/i });
  await user.click(within(svcGroup).getByRole('button', { name: 'Moving' }));
  await user.click(screen.getByRole('button', { name: /continue to step 2/i }));

  // Step 2
  const propGroup = screen.getByRole('group', { name: /property type/i });
  await user.click(within(propGroup).getByRole('button', { name: 'Apartment-Condo' }));
  const sizeGroup = screen.getByRole('group', { name: /apartment\/condo size/i });
  await user.click(within(sizeGroup).getByRole('button', { name: 'Studio 1bed' }));
  await user.click(screen.getByRole('button', { name: /continue to step 3/i }));

  // Step 3 (dual address)
  await user.click(screen.getByRole('button', { name: /continue to moving to/i }));
  await user.click(screen.getByRole('button', { name: /continue to step 4/i }));

  // Step 4
  await user.click(screen.getByRole('button', { name: /continue to step 5/i }));

  // Step 5
  await user.click(screen.getByRole('button', { name: /continue to step 6/i }));

  return user;
}

test('Step 6 Contact Info slides render with exact labels and disable Next until valid', async () => {
  const user = await goToStep6();

  // Heading and subtext
  expect(screen.getByRole('heading', { name: /step 6: contact info/i })).toBeInTheDocument();
  expect(screen.getByText(/we just need a few more details to send you quote over/i)).toBeInTheDocument();

  // Slide 1: Email
  const emailGroup = screen.getByRole('group', { name: /email/i });
  const emailInput = within(emailGroup).getByLabelText(/email/i);
  const nextEmail = screen.getByRole('button', { name: /continue to name/i });
  expect(nextEmail).toBeDisabled();
  await user.type(emailInput, 'invalid');
  expect(nextEmail).toBeDisabled();
  await user.clear(emailInput);
  await user.type(emailInput, 'john@example.com');
  expect(nextEmail).toBeEnabled();
  await user.click(nextEmail);

  // Slide 2: Name (First + Last)
  const nameGroup = screen.getByRole('group', { name: /name/i });
  const firstName = within(nameGroup).getByLabelText(/first name/i);
  const lastName = within(nameGroup).getByLabelText(/last name/i);
  const nextName = screen.getByRole('button', { name: /continue to phone/i });
  expect(nextName).toBeDisabled();
  await user.type(firstName, 'John');
  expect(nextName).toBeDisabled();
  await user.type(lastName, 'Doe');
  expect(nextName).toBeEnabled();
  await user.click(nextName);

  // Slide 3: Phone
  const phoneGroup = screen.getByRole('group', { name: /phone/i });
  const phoneInput = within(phoneGroup).getByLabelText(/phone/i);
  const nextPhone = screen.getByRole('button', { name: /continue to step 7/i });
  expect(nextPhone).toBeDisabled();
  await user.type(phoneInput, '555-555-555'); // 9 digits
  expect(nextPhone).toBeDisabled();
  await user.type(phoneInput, '5'); // now 10 digits
  expect(nextPhone).toBeEnabled();
});

test('Step 6 back navigation across slides works and preserves inputs', async () => {
  const user = await goToStep6();

  // Email slide: enter email then next
  const emailGroup = screen.getByRole('group', { name: /email/i });
  const emailInput = within(emailGroup).getByLabelText(/email/i);
  await user.type(emailInput, 'john@example.com');
  await user.click(screen.getByRole('button', { name: /continue to name/i }));

  // On Name slide, go back to Email and ensure value persists
  await user.click(screen.getByRole('button', { name: /back to email/i }));
  const emailInputAgain = within(screen.getByRole('group', { name: /email/i })).getByLabelText(/email/i);
  expect((emailInputAgain as HTMLInputElement).value).toBe('john@example.com');

  // Go forward to Name, fill names, forward to Phone, then back to Name
  await user.click(screen.getByRole('button', { name: /continue to name/i }));
  const nameGroup = screen.getByRole('group', { name: /name/i });
  await user.type(within(nameGroup).getByLabelText(/first name/i), 'John');
  await user.type(within(nameGroup).getByLabelText(/last name/i), 'Doe');
  await user.click(screen.getByRole('button', { name: /continue to phone/i }));
  await user.click(screen.getByRole('button', { name: /back to name/i }));
  const firstName = within(screen.getByRole('group', { name: /name/i })).getByLabelText(/first name/i) as HTMLInputElement;
  const lastName = within(screen.getByRole('group', { name: /name/i })).getByLabelText(/last name/i) as HTMLInputElement;
  expect(firstName.value).toBe('John');
  expect(lastName.value).toBe('Doe');
});
