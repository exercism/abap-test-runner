CLASS ltcl_simple DEFINITION FOR TESTING RISK LEVEL HARMLESS DURATION SHORT FINAL.

  PRIVATE SECTION.
    METHODS test FOR TESTING RAISING cx_static_check.

ENDCLASS.

CLASS ltcl_simple IMPLEMENTATION.

  METHOD test.
    TYPES: BEGIN OF ty,
             field TYPE i,
           END OF ty.
    DATA data1 TYPE ty.
    DATA data2 TYPE ty.
    data1-field = 1.
    data2-field = 2.
    cl_abap_unit_assert=>assert_equals(
      act = data1
      exp = data2 ).
  ENDMETHOD.

ENDCLASS.