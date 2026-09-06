#!/bin/bash
cd frontend/src || exit

find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  -e 's/fines/penalties/g' \
  -e 's/Fines/Penalties/g' \
  -e 's/fine/penalty/g' \
  -e 's/Fine/Penalty/g' \
  -e 's/books/specimens/g' \
  -e 's/Books/Specimens/g' \
  -e 's/book/specimen/g' \
  -e 's/Book/Specimen/g' \
  -e 's/loans/tendings/g' \
  -e 's/Loans/Tendings/g' \
  -e 's/loan/tending/g' \
  -e 's/Loan/Tending/g' \
  -e 's/members/gardeners/g' \
  -e 's/Members/Gardeners/g' \
  -e 's/member/gardener/g' \
  -e 's/Member/Gardener/g' \
  -e 's/students/apprentices/g' \
  -e 's/Students/Apprentices/g' \
  -e 's/student/apprentice/g' \
  -e 's/Student/Apprentice/g' \
  -e 's/faculty/masters/g' \
  -e 's/Faculty/Masters/g' \
  {} +

cd ..
npm run build
