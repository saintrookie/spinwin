-- Apresiasi Emas prize list: drawn smallest-to-largest, saving the grand
-- prize (5 gram) for last. Safe to run multiple times (only seeds if empty).
insert into prizes (name, description, quantity, display_order)
select v.name, v.description, v.quantity, v.display_order
from (
  values
    ('Emas 1 Gram', '1 gram precious metal (gold)', 2, 0),
    ('Emas 2.5 Gram', '2.5 gram precious metal (gold)', 2, 1),
    ('Emas 5 Gram', '5 gram precious metal (gold)', 1, 2)
) as v(name, description, quantity, display_order)
where not exists (select 1 from prizes);
