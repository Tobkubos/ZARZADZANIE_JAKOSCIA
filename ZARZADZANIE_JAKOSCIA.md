# Zarządzanie jakością

## 1. Opis systemu

### 1.1. Cel systemu

`Swipe` jest przeglądarkową grą zręcznościową typu endless runner. Zadaniem gracza
jest omijanie spadających przeszkód poprzez przesuwanie postaci pomiędzy trzema możliwymi
pasami. Wynik zwiększa się za każdą przeszkodę, która opuści obszar gry bez
kolizji z graczem.

System powinien zapewniać:

- czytelną i responsywną rozgrywkę na komputerze oraz urządzeniach mobilnych,
- płynne sterowanie gestem przesunięcia w lewo lub w prawo,
- jednoznaczne informowanie o stanie gry: menu, rozgrywka, pauza i koniec gry,
- stopniowe zwiększanie poziomu trudności,
- możliwość zapisywania postępu i wyniku po zalogowaniu za pomocą usługi Google auth do bazy danych Firebase.

### 1.2. Główni użytkownicy

- **Gracz niezalogowany** - uruchamia rozgrywkę i korzysta z podstawowych
  funkcji gry; jego postęp nie jest powiązany z profilem online.
- **Gracz zalogowany** - dodatkowo zapisuje rekord, przegląda tabelę wyników
  oraz odblokowuje i wybiera skórki lub efekty.

### 1.3. Podstawowy sposób działania

1. Gracz uruchamia stronę i wybiera przycisk rozpoczęcia gry.
2. Postać znajduje się w jednym z trzech pasów, początkowo w pasie środkowym.
3. Przesunięcie palcem lub wykonanie ruchu myszą zmienia pas postaci. Ruch
   jest ograniczony do skrajnego lewego i prawego pasa.
4. System generuje ostrzeżenia, a następnie spadające przeszkody w losowych
   konfiguracjach jednego lub dwóch pasów.
5. Kolizja kończy bieg. Przejście przeszkody zwiększa wynik, a po kolejnych
   progach wynikowych rośnie prędkość i częstotliwość pojawiania się przeszkód.
6. Po zakończeniu biegu gracz może wrócić do menu / odebrać nagrodę lub rozpocząć grę od nowa.

## 2. Wymagania jakościowe

| ID | Wymaganie | Kryterium jakości |
|---|---|---|
| J-01 | Responsywność | Układ gry i rozmiar elementów dopasowują się do rozmiaru ekranu. |
| J-02 | Sterowanie | Gest lub ruch myszy w poziomie zmienia pas maksymalnie o jeden krok i nie pozwala wyjść poza trzy pasy. |
| J-03 | Czytelność | Ostrzeżenia, wynik, pauza i komunikat końca gry są widoczne i zrozumiałe. |
| J-04 | Płynność | Animacja przeszkód, postaci i przejść scen działa bez zatrzymań podczas typowej rozgrywki. |
| J-05 | Poprawność rozgrywki | Kolizja jest wykrywana tylko dla aktywnie spadającej przeszkody, a przejście przeszkody nalicza dokładnie jeden punkt. |
| J-06 | Stabilność stanu | Restart czyści przeszkody, zeruje wynik i przywraca początkowy poziom trudności. |
| J-07 | Dostępność funkcji | Funkcje zależne od konta są oznaczone jako zablokowane dla użytkownika niezalogowanego. |
| J-08 | Zapisywanie danych | Dla zalogowanego użytkownika rekord i odblokowane elementy są synchronizowane z profilem. |
| J-09 | Obsługa urządzeń | Gra reaguje zarówno na zdarzenia dotyku, jak i myszy. |

## 3. Kryteria akceptacji

System uznaje się za spełniający wymagania jakościowe, gdy:

- gra uruchamia się w obsługiwanej przeglądarce bez błędów blokujących
  rozgrywkę,
- rozpoczęcie gry wyświetla scenę rozgrywki i zeruje poprzedni wynik,
- postać pozostaje w granicach trzech pasów, a sterowanie lewo/prawo działa
  dla dotyku i myszy,
- ostrzeżenia są wyświetlane przed pojawieniem się przeszkód,
- kolizja z przeszkodą kończy bieżący bieg, a ominięcie przeszkody zwiększa
  wynik o jeden,
- pauza zatrzymuje możliwość kontynuowania rozgrywki do momentu wznowienia,
- restart przywraca stan początkowy bez pozostałości po poprzednim biegu,
- interfejs pozostaje użyteczny na małym ekranie i na komputerze,
- logowanie nie jest wymagane do rozpoczęcia gry, a po zalogowaniu wynik może
  zostać zapisany i wyświetlony w tabeli wyników.

## 4. Rejestr ryzyk

### 4.1. Najważniejsze ryzyka

| ID | Ryzyko | Skutek |
|---|---|---|
| R-01 | Błędne wykrywanie kolizji na granicy pasa lub przy zmianie rozmiaru ekranu | Niesprawiedliwe zakończenie gry albo możliwość przejścia przez przeszkodę. |
| R-02 | Nieprawidłowa obsługa szybkich lub wielokrotnych gestów | Postać zmienia pas więcej razy, niż oczekuje gracz. |
| R-03 | Rozbieżność czasu animacji między urządzeniami | Różna trudność gry i niestabilna prędkość przeszkód. |
| R-04 | Pozostawienie starego stanu po restarcie lub zmianie sceny | Błędny wynik, przeszkody z poprzedniej rozgrywki albo nieprawidłowy stan postaci. |
| R-05 | Niedostępność usługi logowania lub bazy danych | Brak zapisu rekordu i danych profilu. |
| R-06 | Nieczytelny interfejs na małym ekranie | Utrudniona obsługa lub przypadkowe naciśnięcia. |

### 4.2. Ocena ryzyk

Skala oceny: prawdopodobieństwo i wpływ od 1 (niski) do 3 (wysoki).
Priorytet jest iloczynem obu wartości.

| ID | Prawdopodobieństwo | Wpływ | Priorytet |
|---|---:|---:|---:|
| R-01 | 3 | 3 | 9 |
| R-02 | 2 | 3 | 6 |
| R-03 | 2 | 3 | 6 |
| R-04 | 2 | 3 | 6 |
| R-05 | 2 | 2 | 4 |
| R-06 | 2 | 2 | 4 |

### 4.3. Priorytetyzacja

W pierwszej kolejności należy sprawdzić kolizje i granice pasów (R-01).
Następnie należy zweryfikować sterowanie, czas animacji i reset stanu (R-02,
R-03, R-04), ponieważ te obszary bezpośrednio wpływają na uczciwość oraz
powtarzalność rozgrywki. Integrację z kontem i responsywność należy sprawdzić
po potwierdzeniu poprawności podstawowej pętli gry.

### 4.4. Sposób postępowania

- Dla R-01 i R-02: sprawdzić skrajne pasy, granice obiektów oraz serię
  szybkich gestów.
- Dla R-03: wykonać rozgrywkę na komputerze i urządzeniu mobilnym oraz
  sprawdzić, czy ruch zależny od czasu zachowuje tę samą logikę.
- Dla R-04: sprawdzić rozpoczęcie, pauzę, wznowienie, restart i powrót do
  menu w różnych kolejnościach.
- Dla R-05: sprawdzić działanie trybu niezalogowanego oraz zachowanie po
  nieudanym logowaniu lub braku odpowiedzi usługi.
- Dla R-06: sprawdzić widok pionowy i poziomy na małym ekranie oraz obsługę
  elementów interfejsu bez nachodzenia na siebie.

## 5. Plan testów

### 5.1. Co należy przetestować?

Zakres obejmuje:

- uruchamianie gry i przechodzenie pomiędzy scenami,
- sterowanie dotykiem i myszą,
- ograniczenie ruchu do trzech pasów,
- generowanie ostrzeżeń i przeszkód,
- wykrywanie kolizji oraz naliczanie wyniku,
- wzrost poziomu trudności,
- pauzę, wznowienie, restart i zakończenie gry,
- responsywność interfejsu,
- logowanie, zapis rekordu oraz wyświetlanie tabeli wyników,
- wybór odblokowanych skórek i efektów.

### 5.2. Rodzaje testów

- **Testy funkcjonalne** – sprawdzenie działania funkcji gry zgodnie z
  wymaganiami i kryteriami akceptacji.
- **Testy integracyjne** – sprawdzenie współpracy interfejsu, pętli gry,
  zarządzania scenami oraz modułu zapisu danych.
- **Testy użyteczności** – ocena czytelności komunikatów, ostrzeżeń,
  przycisków i sposobu sterowania.
- **Testy responsywności** – porównanie działania na komputerze, ekranie
  dotykowym oraz przy różnych rozmiarach okna.
- **Testy regresji** – ponowne sprawdzenie podstawowej rozgrywki po zmianach
  w sterowaniu, kolizjach, scenach lub zapisie danych.
- **Testy odporności** – sprawdzenie zachowania przy szybkich gestach,
  wielokrotnym restartowaniu, zmianie scen oraz braku połączenia z usługą
  użytkownika.

### 5.3. Przypadki / scenariusze testowe

| ID | Scenariusz | Oczekiwany rezultat |
|---|---|---|
| T-01 | Otworzyć aplikację i rozpocząć grę przyciskiem Start. | Wyświetla się scena gry, wynik wynosi 0, a stan przeszkód jest początkowy. |
| T-02 | Wykonać przesunięcie w lewo i w prawo na urządzeniu dotykowym. | Postać zmienia pas zgodnie z kierunkiem gestu. |
| T-03 | Wykonać ruch myszą w lewo i w prawo. | Sterowanie myszą działa tak samo jak sterowanie dotykiem. |
| T-04 | Próbować przejść w lewo z lewego pasa i w prawo z prawego pasa. | Postać pozostaje odpowiednio w skrajnym pasie. |
| T-05 | Wykonać kilka szybkich gestów podczas jednego przebiegu. | Postać nie opuszcza zakresu trzech pasów, a każdy ruch jest ograniczony do prawidłowej logiki. |
| T-06 | Obserwować ostrzeżenie i nadchodzącą przeszkodę. | Ostrzeżenie pojawia się przed przeszkodą, a przeszkoda przechodzi przez stan ostrzeżenia, pojawienia się i spadania. |
| T-07 | Pozostać w pasie zajętym przez spadającą przeszkodę. | Kolizja kończy bieg i wyświetla ekran Game Over. |
| T-08 | Zmienić pas i ominąć spadającą przeszkodę. | Bieg trwa dalej, a po opuszczeniu obszaru gry wynik zwiększa się o jeden. |
| T-09 | Kontynuować bieg przez co najmniej kilka progów wynikowych. | Trudność rośnie zgodnie z zasadami, bez zerowania wyniku w trakcie biegu. |
| T-10 | Włączyć pauzę i następnie wznowić grę. | Pojawia się panel pauzy, a po wznowieniu można kontynuować bieżący bieg. |
| T-11 | Po Game Over wybrać Restart. | Rozpoczyna się nowy bieg z wyzerowanym wynikiem i usuniętymi przeszkodami. |
| T-12 | Po Game Over wybrać Menu. | Aplikacja wraca do menu głównego bez pozostawienia widoku Game Over. |
| T-13 | Zmienić rozmiar okna oraz uruchomić grę na ekranie mobilnym. | Plansza, postać i elementy UI pozostają widoczne oraz możliwe do obsługi. |
| T-14 | Otworzyć opcje jako użytkownik niezalogowany. | Funkcje wymagające konta są oznaczone jako niedostępne, a rozpoczęcie gry nadal działa. |
| T-15 | Zalogować użytkownika, zakończyć bieg i otworzyć tabelę wyników. | Rekord jest zapisany dla profilu i może zostać wyświetlony w tabeli wyników. |
