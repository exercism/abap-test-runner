CLASS ltc_sign DEFINITION FINAL FOR TESTING DURATION SHORT RISK LEVEL HARMLESS.
  PRIVATE SECTION.
    DATA cut TYPE REF TO zcl_custom_signs.
    METHODS setup.
    METHODS occasion_is_birthday FOR TESTING RAISING cx_static_check.
ENDCLASS.

CLASS ltc_sign IMPLEMENTATION.
  METHOD setup.
    cut = NEW zcl_custom_signs( ).
  ENDMETHOD.

  METHOD occasion_is_birthday.
    cl_abap_unit_assert=>assert_equals(
      act = cut->build_sign(
              occasion = 'Birthday'
              name     = 'Jack' )
      exp = |Happy Birthday\nJack!| ).
  ENDMETHOD.
ENDCLASS.