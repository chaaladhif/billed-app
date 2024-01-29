/**
 * @jest-environment jsdom
 */
import { screen, waitFor,fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import userEvent from '@testing-library/user-event';
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import mockStore from "../__mocks__/store.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId('icon-mail'));
      const mailIcon = screen.getByTestId('icon-mail');
      //console.log('mailIcon.classList:', mailIcon.classList); 
      // j'ai ajouté cette ligne pour vérifier que l'icône de l'email est en surbrillance
      expect(mailIcon.classList.contains("active-icon")).toBe(true);
    });
  });
  //test unitaire
  describe("When I am on NewBill Page and I filled all required inputs and add a png", () => {
    // TEST : ajout du test de l'ouverture de la page bills lors de la complétion du formulaire
    test("Then it should open bills page", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      // Mise en place de l'environnement de test
      const onNavigate = pathname => { document.body.innerHTML = ROUTES({ pathname }); };
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      // Initialisation de la classe newbill
      const newBillContainer = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage });    
      jest.spyOn(newBillContainer, "onNavigate");
      newBillContainer.fileUrl = "https://my-url.com/image.png";
      newBillContainer.fileName = "image.png";
      // déclare un evenement fake avec ce dont on a besoin pour faire le test
      const fakeEvent = {
        preventDefault: jest.fn(),
        target: {
          querySelector: jest.fn().mockImplementation((input) => {
            if (input === `select[data-testid="expense-type"]`) {
              return { value: "Transports" };
            }
            if (input === `input[data-testid="amount"]`) {
              return { value: 200 };
            }
            if (input === `input[data-testid="datepicker"]`) {
              return { value: "1994-10-22" };
            }
            if (input === `input[data-testid="pct"]`) {
              return { value: 20 };
            }
            return { value: undefined };
          }),
        },
      };

      // on appelle la function handleSubmit en lui passant l'evenement fake
      newBillContainer.handleSubmit(fakeEvent);
      // expect que l'on passe à la page Bills car la function onNavigate() a été appelé
      expect(newBillContainer.onNavigate).toHaveBeenCalledWith("#employee/bills");
    });
  });
});
  //test unitaire 02
  describe("When I am on Newbill page and I upload an invalid image format", () => {
  test("Then it should show a message on the console", () => {
    // Mock console.error to capture messages
  const html = NewBillUI();
      document.body.innerHTML = html;
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

  const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  const fileInput = document.querySelector(`input[data-testid="file"]`);
  // Create a file with an invalid extension (e.g., txt)
  const invalidFile = new File([""], "invalid.txt", { type: "text/plain" });
  // Simulate the change event with the invalid file
  userEvent.upload(fileInput, invalidFile);
  // Check if console.error was called with the expected error message
  expect(consoleErrorMock).toHaveBeenCalledWith('Extension de fichier non autorisée.');
  // Restore the original console.error implementation
  consoleErrorMock.mockRestore();
});
  });

// test d'intégration POST
describe("When I am on NewBill Page, I fill the form and submit", () => {
  test("Then the bill is added to API POST", async () => {
    const html = NewBillUI()
    document.body.innerHTML = html

    const bill = {
      email: "employee@test.tld",
      type: "Transports",
      name: "TGV",
      amount: 120,
      date: "2023-08-24",
      vat: "20",
      pct: 20,
      commentary: "Facture test",
      fileUrl: "testFacture.png",
      fileName: "testFacture",
      status: 'pending'
    };

    const typeField = screen.getByTestId("expense-type");
    fireEvent.change(typeField, { target: { value: bill.type } });
    expect(typeField.value).toBe(bill.type);
    const nameField = screen.getByTestId("expense-name");
    fireEvent.change(nameField, { target: { value: bill.name } });
    expect(nameField.value).toBe(bill.name);
    const dateField = screen.getByTestId("datepicker");
    fireEvent.change(dateField, { target: { value: bill.date } });
    expect(dateField.value).toBe(bill.date);
    const amountField = screen.getByTestId("amount");
    fireEvent.change(amountField, { target: { value: bill.amount } });
    expect(parseInt(amountField.value)).toBe(parseInt(bill.amount));
    const vatField = screen.getByTestId("vat");
    fireEvent.change(vatField, { target: { value: bill.vat } });
    expect(parseInt(vatField.value)).toBe(parseInt(bill.vat));
    const pctField = screen.getByTestId("pct");
    fireEvent.change(pctField, { target: { value: bill.pct } });
    expect(parseInt(pctField.value)).toBe(parseInt(bill.pct));
    const commentaryField = screen.getByTestId("commentary");
    fireEvent.change(commentaryField, { target: { value: bill.commentary } });
    expect(commentaryField.value).toBe(bill.commentary);

    const newBillForm = screen.getByTestId("form-new-bill");
    const onNavigate = pathname => { document.body.innerHTML = ROUTES({ pathname }); };
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

    const handleChangeFile = jest.fn(newBill.handleChangeFile);
    newBillForm.addEventListener("change", handleChangeFile);
    const fileField = screen.getByTestId("file");
    fireEvent.change(fileField, { target: { files: [ new File([bill.fileName], bill.fileUrl, { type: "image/png" }) ] } });
    expect(fileField.files[0].name).toBe(bill.fileUrl);
    expect(fileField.files[0].type).toBe("image/png");
    expect(handleChangeFile).toHaveBeenCalled();

    const handleSubmit = jest.fn(newBill.handleSubmit);
    newBillForm.addEventListener("submit", handleSubmit);
    fireEvent.submit(newBillForm);
    expect(handleSubmit).toHaveBeenCalled();
  });
});
